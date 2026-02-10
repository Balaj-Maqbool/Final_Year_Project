import { Notification } from "../models/notification.model.js";
import { ValidationHelper } from "../utils/validation.utils.js";

class SSEManager {
    // private variables
    #activeConnections;
    #HEARTBEAT_INTERVAL_MS;

    constructor() {
        this.#activeConnections = new Map();
        this.#HEARTBEAT_INTERVAL_MS = 30000;

        this.#startHeartbeat();
    }

    #startHeartbeat() {
        setInterval(() => {
            this.#activeConnections.forEach((userConnections) => {
                for (const connection of userConnections) {
                    try {
                        connection.res.write(": keepalive\n\n");
                    } catch (error) {}
                }
            });
        }, this.#HEARTBEAT_INTERVAL_MS);
    }

    registerConnection(userId, role, res, req) {
        if (ValidationHelper.isEmpty(userId)) {
            res.writeHead(400);
            res.end("Invalid User ID");
            return;
        }

        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*"
        });

        const id = userId.toString();

        if (!this.#activeConnections.has(id)) {
            this.#activeConnections.set(id, new Set());
        }

        const connection = { res, role };
        this.#activeConnections.get(id).add(connection);

        const initData = { message: "Connected to Real-time Events" };
        connection.res.write(`data: ${JSON.stringify(initData)}\n\n`);

        const cleanup = () => {
            const userConnections = this.#activeConnections.get(id);
            if (userConnections) {
                userConnections.delete(connection);
                if (userConnections.size === 0) {
                    this.#activeConnections.delete(id);
                }
            }
        };

        req.on("close", cleanup);
        req.on("error", cleanup);
    }

    async sendToUser(userId, type, data, saveToDb = true) {
        if (ValidationHelper.isEmpty(userId)) return false;
        const id = userId.toString();

        if (saveToDb) {
            try {
                const relatedId =
                    data.jobId || data.taskId || data.relatedId || null;
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

        const userConnections = this.#activeConnections.get(id);
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

    broadcast(type, data, targetRole = null) {
        const payload = JSON.stringify(data);
        this.#activeConnections.forEach((userConnections) => {
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
