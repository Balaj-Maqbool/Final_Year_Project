import { WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../constants.js";
import { User } from "../models/user.model.js";
import { ChatService } from "../services/chat.service.js";
import { ChatThread } from "../models/chat.model.js";

class ChatManager {
    #HEARTBEAT_INTERVAL_MS = 30000;
    #onlineUsers = new Map();
    #heartbeatInterval;

    constructor() {
        this.#startHeartbeat();
    }

    /**
     * Private method to manage connection health checks
     */
    #startHeartbeat() {
        this.#heartbeatInterval = setInterval(() => {
            this.#onlineUsers.forEach((sockets, userId) => {
                sockets.forEach((ws) => {
                    if (ws.isAlive === false) {
                        console.log(`Terminating zombie connection for User: ${ws.user?.username}`);
                        return ws.terminate();
                    }

                    ws.isAlive = false;
                    ws.ping();
                });
            });
        }, this.#HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Authenticates a request by manually parsing cookies and verifying JWT.
     * Used during the 'upgrade' handshake.
     */
    async authenticate(nodeReq) {
        try {
            const cookieHeader = nodeReq.headers.cookie;
            if (!cookieHeader) return null;

            // Parse cookies manually from the header string
            const cookies = Object.fromEntries(
                cookieHeader.split(';').map(c => c.trim().split('='))
            );

            const token = cookies.accessToken;
            if (!token) return null;

            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            if (!decoded?._id) return null;

            const user = await User.findById(decoded._id).select("-password -refreshToken");
            return user || null;
        } catch (error) {
            console.error("Socket Auth Error:", error.message);
            return null;
        }
    }

    /**
     * Called when a new socket connection is established
     */
    onConnect(ws, user) {
        const userId = user._id.toString();

        if (!this.#onlineUsers.has(userId)) {
            this.#onlineUsers.set(userId, new Set());
        }

        this.#onlineUsers.get(userId).add(ws);
        ws.user = user; // Attach user info to socket
        ws.isAlive = true; // Heartbeat flag

        console.log(`User connected: ${user.username} (${ws.user.role})`);

        // Handle incoming messages
        ws.on("message", (data) => this.#onMessage(ws, data));

        // Handle Pong from client
        ws.on("pong", () => {
            ws.isAlive = true;
        });

        ws.on("close", () => this.onDisconnect(ws));
        ws.on("error", (err) => {
            console.error(`Socket error for ${user.username}:`, err.message);
            this.onDisconnect(ws);
        });
    }

    /**
     * Orchestrates message flow: Validation -> Persistence -> Broadcasting
     */
    async #onMessage(ws, data) {
        try {
            const payload = JSON.parse(data);
            const { threadId, content, attachments } = payload;

            if (!threadId || !content) return;

            // 1. Fetch Thread
            const thread = await ChatThread.findById(threadId);
            if (!thread || !thread.participants.includes(ws.user._id)) {
                return ws.send(JSON.stringify({
                    type: "ERROR",
                    message: "Unauthorized or invalid thread"
                }));
            }

            // 2. Validate Permission (Business Logic via Service)
            const { canSend, reason } = await ChatService.validateMessagePermission(thread, ws.user);
            if (!canSend) {
                return ws.send(JSON.stringify({
                    type: "ERROR",
                    message: reason
                }));
            }

            // 3. Process Message (Persistence + Notifications via Service)
            const message = await ChatService.processNewMessage(thread, ws.user, content, attachments);

            // 4. Forward to all participants via WebSocket
            const responsePayload = {
                type: "NEW_MESSAGE",
                data: message
            };

            thread.participants.forEach(participantId => {
                this.sendToUser(participantId, responsePayload);
            });

        } catch (error) {
            console.error("Message processing error:", error.message);
            ws.send(JSON.stringify({ type: "ERROR", message: "Server error during message processing" }));
        }
    }

    /**
     * Called when a socket disconnects
     */
    onDisconnect(ws) {
        if (!ws.user) return;
        const userId = ws.user._id.toString();

        const userSockets = this.#onlineUsers.get(userId);
        if (userSockets) {
            userSockets.delete(ws);
            if (userSockets.size === 0) {
                this.#onlineUsers.delete(userId);
            }
        }
        console.log(`User disconnected: ${ws.user.username}`);
    }

    /**
     * Checks if a user is online
     */
    isUserOnline(userId) {
        return this.#onlineUsers.has(userId.toString());
    }

    /**
     * Sends a message to all active sockets of a specific user
     */
    sendToUser(userId, data) {
        const userSockets = this.#onlineUsers.get(userId.toString());
        if (userSockets) {
            const payload = JSON.stringify(data);
            userSockets.forEach(ws => {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(payload);
                }
            });
        }
    }
}

export const chatManager = new ChatManager();
