import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, CORS_ORIGIN } from "../constants.js";
import { User } from "../models/user.model.js";
import { chatService } from "../services/chat.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";

class SocketManager {
    #io;
    #onlineUsers;

    constructor() {
        this.#onlineUsers = new Map();
        this.socketLimiter = RateLimitManager.socketMessage();
    }

    initialize(httpServer) {
        this.#io = new Server(httpServer, {
            cors: {
                origin: CORS_ORIGIN,
                credentials: true
            },
            pingTimeout: 60000
        });

        this.#io.use(async (socket, next) => {
            try {
                let token = null;
                const handshake = socket.handshake;

                if (handshake.headers.cookie) {
                    const parsedCookies = Object.fromEntries(
                        handshake.headers.cookie
                            .split(";")
                            .map((c) => c.trim().split("="))
                    );
                    if (parsedCookies.accessToken) {
                        token = parsedCookies.accessToken;
                        console.log("Socket Auth: Found accessToken in cookie");
                    } else {
                         console.log("Socket Auth: Cookie present but no accessToken found. Keys:", Object.keys(parsedCookies));
                    }
                } else {
                    console.log("Socket Auth: No cookie header received");
                }

                if (!token && handshake.auth && handshake.auth.token) {
                    token = handshake.auth.token;
                }

                if (!token && handshake.headers.authorization) {
                    const authHeader = handshake.headers.authorization;
                    if (authHeader.startsWith("Bearer ")) {
                        token = authHeader.split(" ")[1];
                    }
                }

                if (ValidationHelper.isEmpty(token)) {
                    console.error("Socket Auth Error: Token missing");
                    return next(
                        new Error("Authentication error: Token missing")
                    );
                }

                const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
                if (!decoded?._id) {
                    console.error("Socket Auth Error: Invalid token payload");
                    return next(
                        new Error("Authentication error: Invalid token")
                    );
                }

                const user = await User.findById(decoded._id).select(
                    "-password -refreshToken"
                );
                if (!user) {
                    console.error("Socket Auth Error: User not found");
                    return next(
                        new Error("Authentication error: User not found")
                    );
                }

                socket.user = user;
                next();
            } catch (error) {
                console.error("Socket Auth Error:", error.message);
                next(new Error("Authentication error: " + error.message));
            }
        });

        this.#io.on("connection", (socket) => {
            this.#onConnection(socket);
        });
    }

    #onConnection(socket) {
        const userId = socket.user._id.toString();

        if (!this.#onlineUsers.has(userId)) {
            this.#onlineUsers.set(userId, new Set());
        }
        this.#onlineUsers.get(userId).add(socket.id);

        socket.join(userId);

        this.#setupEventHandlers(socket);

        socket.on("disconnect", () => {
            const userSockets = this.#onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    this.#onlineUsers.delete(userId);
                }
            }
        });
    }

    #setupEventHandlers(socket) {
        socket.on("join_thread", (threadId) => {
            socket.join(threadId);
        });

        socket.on("leave_thread", (threadId) => {
            socket.leave(threadId);
        });

        socket.on("send_message", async (payload) => {
            try {
                await this.socketLimiter.consume(socket.user._id.toString());
            } catch (rateLimitError) {
                console.warn(
                    `Rate Limit Exceeded for user ${socket.user.username}`
                );
                return socket.emit("error", {
                    type: "RATE_LIMIT",
                    message:
                        "You are sending messages too fast. Please slow down."
                });
            }

            try {
                if (typeof payload === "string") {
                    try {
                        payload = JSON.parse(payload);
                    } catch (e) {
                        console.error("Failed to parse payload string:", e);
                    }
                }

                const { threadId, content, attachments, replyTo } = payload;
                const userId = socket.user._id;

                if (content && content.length > 5000) {
                    return socket.emit("error", {
                        type: "VALIDATION_ERROR",
                        message:
                            "Message content must be less than 5000 characters"
                    });
                }

                if (attachments && attachments.length > 5) {
                    return socket.emit("error", {
                        type: "VALIDATION_ERROR",
                        message: "Maximum 5 attachments allowed"
                    });
                }

                const validation = await chatService.validateMessagePermission(
                    threadId,
                    userId
                );

                if (!validation.canSend) {
                    return socket.emit("error", {
                        type: "SEND_FAILED",
                        message: validation.error
                    });
                }

                const thread = validation.thread;
                const recipientId = thread.participants
                    .find((p) => p.toString() !== userId.toString())
                    .toString();

                const isRecipientOnline = this.isUserOnline(recipientId);
                const initialStatus = isRecipientOnline ? "delivered" : "sent";

                const message = await chatService.saveMessage(
                    threadId,
                    userId,
                    content,
                    attachments,
                    initialStatus,
                    replyTo
                );

                this.emitToRoom(threadId, "new_message", message);

                if (this.isUserOnline(recipientId)) {
                    this.emitToRoom(recipientId, "new_message_notification", {
                        title: `New message from ${socket.user.fullName}`,
                        message: content || "Sent an attachment",
                        threadId: threadId,
                        senderId: userId
                    });
                }
            } catch (error) {
                console.error("Send Message Error:", error);
                socket.emit("error", {
                    type: "SERVER_ERROR",
                    message: "Failed to send message"
                });
            }
        });

        socket.on("mark_read", async (threadId) => {
            const success = await chatService.markMessagesAsRead(
                threadId,
                socket.user._id
            );
            if (success) {
                this.#io.to(threadId).emit("messages_read", {
                    threadId,
                    readerId: socket.user._id
                });
            }
        });

        socket.on("typing_start", (threadId) => {
            socket.to(threadId).emit("user_typing", {
                threadId,
                userId: socket.user._id,
                isTyping: true
            });
        });

        socket.on("typing_stop", (threadId) => {
            socket.to(threadId).emit("user_typing", {
                threadId,
                userId: socket.user._id,
                isTyping: false
            });
        });
    }

    getIO() {
        if (!this.#io) {
            throw new Error("Socket.io not initialized!");
        }
        return this.#io;
    }

    isUserOnline(userId) {
        return this.#onlineUsers.has(userId.toString());
    }

    emitToRoom(roomId, event, data) {
        if (!this.#io) return;
        this.#io.to(roomId).emit(event, data);
    }
}

export const socketManager = new SocketManager();
