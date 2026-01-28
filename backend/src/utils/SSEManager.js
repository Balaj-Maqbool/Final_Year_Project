import { Notification } from "../models/notification.model.js";

class SSEManager {
    constructor() {
        // Map<UserId, Set<ConnectionObject>>
        this.activeConnections = new Map();
        this.HEARTBEAT_INTERVAL_MS = 30000;

        // Start the global heartbeat. 
        // We do NOT need to clear this interval because this Manager 
        // lives as long as the application runs.
        this.startHeartbeat();
    }

    startHeartbeat() {
        setInterval(() => {
            // Efficiently ping only active connections
            this.activeConnections.forEach((userConnections) => {
                for (const connection of userConnections) {
                    // If a response is closed, it might throw, so we can wrap in try-catch or rely on the 'close' event handler cleanup
                    try {
                        connection.res.write(': keepalive\n\n');
                    } catch (error) {
                        // Client likely disconnected, cleanup will happen via 'close' event
                    }
                }
            });
        }, this.HEARTBEAT_INTERVAL_MS);
    }

    /**
     * Registers a new client connection for SSE.
     * @param {string} userId - The ID of the connected user.
     * @param {string} role - The role of the connected user.
     * @param {object} res - The Express response object.
     * @param {object} req - The Express request object.
     */
    registerConnection(userId, role, res, req) {
        // 1. Set SSE Headers
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*"
        });

        const id = userId.toString();

        // 2. Add to active connections map
        if (!this.activeConnections.has(id)) {
            this.activeConnections.set(id, new Set());
        }

        const connection = { res, role };
        this.activeConnections.get(id).add(connection);

        // 3. Send initial connection confirmation
        const initData = { message: "Connected to Real-time Events" };
        connection.res.write(`data: ${JSON.stringify(initData)}\n\n`);

        console.log(`SSE Client Connected: ${id} (${role})`);

        // 4. Handle Disconnect & Errors
        const cleanup = () => {
            console.log(`SSE Client Disconnected/Error: ${id}`);
            const userConnections = this.activeConnections.get(id);
            if (userConnections) {
                userConnections.delete(connection);
                if (userConnections.size === 0) {
                    this.activeConnections.delete(id);
                }
            }
        };

        req.on("close", cleanup);
        req.on("error", cleanup);
    }

    /**
     * Sends an event to a specific user.
     */
    async sendToUser(userId, type, data, saveToDb = true) {
        const id = userId.toString();

        // 1. Persist to Database (if requested)
        if (saveToDb) {
            try {
                const relatedId = data.jobId || data.taskId || data.relatedId || null;
                await Notification.create({
                    recipient: userId,
                    type: data.type || "SYSTEM",
                    message: data.message || "New Notification",
                    relatedId
                });
            } catch (error) {
                console.error("Failed to save notification:", error);
            }
        }

        // 2. Send Real-time Event
        const userConnections = this.activeConnections.get(id);
        if (userConnections && userConnections.size > 0) {
            const payload = JSON.stringify(data);
            for (const connection of userConnections) {
                connection.res.write(`event: ${type}\n`);
                connection.res.write(`data: ${payload}\n\n`);
            }
            return true;
        }
        return false;
    }

    /**
     * Broadcasts an event to ALL active connected users.
     */
    broadcast(type, data, targetRole = null) {
        const payload = JSON.stringify(data);
        this.activeConnections.forEach((userConnections) => {
            for (const connection of userConnections) {
                if (targetRole && connection.role !== targetRole) {
                    continue;
                }
                connection.res.write(`event: ${type}\n`);
                connection.res.write(`data: ${payload}\n\n`);
            }
        });
    }
}

export const sseManager = new SSEManager();
