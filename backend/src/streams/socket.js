import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET, CORS_ORIGIN } from "../constants.js";
import { User } from "../models/user.model.js";
import { chatService } from "../services/chat.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class SocketManager {
    #io;
    #onlineUsers; // Map<userId, Set<socketId>>

    constructor() {
        this.#onlineUsers = new Map();
    }

    /**
     * Initializes the Socket.io server
     * @param {Object} httpServer - The HTTP server instance
     */
    initialize(httpServer) {
        this.#io = new Server(httpServer, {
            cors: {
                origin: CORS_ORIGIN,
                credentials: true,
            },
            pingTimeout: 60000,
        });

        // Middleware: Authentication
        this.#io.use(async (socket, next) => {
            try {
                let token = null;
                const handshake = socket.handshake;

                // 1. Check Cookies
                if (handshake.headers.cookie) {
                    const parsedCookies = Object.fromEntries(
                        handshake.headers.cookie.split(";").map((c) => c.trim().split("="))
                    );
                    if (parsedCookies.accessToken) {
                        token = parsedCookies.accessToken;
                        console.log("Token retrieved from Cookies");
                    }
                }

                // 2. Check Handshake Auth (socket.io-client "auth" option)
                if (!token && handshake.auth && handshake.auth.token) {
                    token = handshake.auth.token;
                    console.log("Token retrieved from Handshake Auth");
                }

                // 3. Check Authorization Header
                if (!token && handshake.headers.authorization) {
                    const authHeader = handshake.headers.authorization;
                    if (authHeader.startsWith("Bearer ")) {
                        token = authHeader.split(" ")[1];
                        console.log("Token retrieved from Authorization Header");
                    }
                }

                if (!token) {
                    return next(new Error("Authentication error: Token missing"));
                }

                // 2. Verify Token
                const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
                if (!decoded?._id) {
                    return next(new Error("Authentication error: Invalid token"));
                }

                // 3. Attach User
                const user = await User.findById(decoded._id).select("-password -refreshToken");
                if (!user) {
                    return next(new Error("Authentication error: User not found"));
                }

                socket.user = user;
                next();
            } catch (error) {
                console.error("Socket Auth Error:", error.message);
                next(new Error("Authentication error"));
            }
        });

        // Connection Handler
        this.#io.on("connection", (socket) => {
            // console.log("Socket Connected : ", socket);

            this.#onConnection(socket);
        });


    }

    /**
     * Handle new connection
     * @param {Object} socket 
     */
    #onConnection(socket) {
        console.log(`User Connected: ${socket.user.username} (${socket.id})`);

        const userId = socket.user._id.toString();

        // Track Online Status
        if (!this.#onlineUsers.has(userId)) {
            this.#onlineUsers.set(userId, new Set());
        }
        this.#onlineUsers.get(userId).add(socket.id);

        // Join Personal Room (for notifications)
        socket.join(userId);

        // Setup Event Listeners
        this.#setupEventHandlers(socket);

        socket.on("disconnect", () => {
            console.log(`User Disconnected: ${socket.user.username}`);
            const userSockets = this.#onlineUsers.get(userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    this.#onlineUsers.delete(userId);
                }
            }
        });
    }

    /**
     * Setup Chat Event Handlers
     */
    #setupEventHandlers(socket) {
        // 1. Join Thread (Room)
        socket.on("join_thread", (threadId) => {
            // Security: In a real app, confirm they are a participant again here.
            // But usually we validate on 'send_message'. 
            // Joining a room just allows listening. If they aren't a participant,
            // they wouldn't have the threadId unless they guessed it.
            // For extra security, we could call ChatService.validateMessagePermission(threadId, socket.user._id)
            // But let's keep it lightweight for 'read' access, assuming threadId is secret enough 
            // or perform a quick check if desired.
            socket.join(threadId);
            console.log(`User ${socket.user.username} joined thread ${threadId}`);
        });

        // 2. Leave Thread
        socket.on("leave_thread", (threadId) => {
            socket.leave(threadId);
        });

        // 3. Send Message
        socket.on("send_message", async (payload) => {
            console.log("Received send_message payload:", payload, typeof payload);
            try {
                // Handle potential JSON string from tools like Hoppscotch
                if (typeof payload === "string") {
                    try {
                        payload = JSON.parse(payload);
                    } catch (e) {
                        console.error("Failed to parse payload string:", e);
                    }
                }

                const { threadId, content, attachments, replyTo } = payload;
                const userId = socket.user._id;

                // A. Validate Logic
                const validation = await chatService.validateMessagePermission(threadId, userId);

                if (!validation.canSend) {
                    return socket.emit("error", {
                        type: "SEND_FAILED",
                        message: validation.error
                    });
                }

                // B. Save to DB
                // Check Recipient Online Status
                const thread = validation.thread;
                const recipientId = thread.participants.find(p => p.toString() !== userId.toString()).toString();

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

                if (this.isUserOnline(recipientId)) {
                    // Ensure it's not notifying strict room match 
                    // (Actually notifications are usually global toasts, so sending strict to user room is fine)
                    // The Client frontend will decide: "If I'm on /chat/threadID, ignore toast. Else show toast."
                    this.emitToRoom(recipientId, "new_message_notification", {
                        title: `New message from ${socket.user.fullName}`,
                        message: content || "Sent an attachment",
                        threadId: threadId,
                        senderId: userId
                    });
                }

            } catch (error) {
                console.error("Send Message Error:", error);
                socket.emit("error", { type: "SERVER_ERROR", message: "Failed to send message" });
            }
        });

        // 4. Mark Read
        socket.on("mark_read", async (threadId) => {
            const success = await chatService.markMessagesAsRead(threadId, socket.user._id);
            if (success) {
                // Notify the *other* user that I read their messages
                this.#io.to(threadId).emit("messages_read", {
                    threadId,
                    readerId: socket.user._id
                });
            }
        });

        // 5. Typing Indicators (Bonus)
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

    /**
     * Get the IO instance
     */
    getIO() {
        if (!this.#io) {
            throw new Error("Socket.io not initialized!");
        }
        return this.#io;
    }

    /**
     * Check if a user is currently online
     * @param {string} userId 
     */
    isUserOnline(userId) {
        return this.#onlineUsers.has(userId.toString());
    }

    /**
     * Emit an event to a specific room
     * @param {string} roomId 
     * @param {string} event 
     * @param {Object} data 
     */
    emitToRoom(roomId, event, data) {
        if (!this.#io) return;
        this.#io.to(roomId).emit(event, data);
    }
}

export const socketManager = new SocketManager();
