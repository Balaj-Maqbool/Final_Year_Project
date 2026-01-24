import { Notification } from "../models/notification.model.js";

class SSEManager {
    constructor() {
        // Map<UserId, ResponseObject>
        // Note: For production with multiple instances (clusters), you'd need Redis. 
        // For this single-instance project, memory Map is fine.
        this.clients = new Map();
    }

    /**
     * Registers a new client connection for SSE.
     * @param {string} userId - The ID of the connected user.
     * @param {string} role - The role of the connected user.
     * @param {object} res - The Express response object.
     * @param {object} req - The Express request object (to listen for close).
     */
    addClient(userId, role, res, req) {
        // 1. Set SSE Headers
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*"
        });

        const id = userId.toString();

        // 2. Add to active clients map
        if (!this.clients.has(id)) {
            this.clients.set(id, []);
        }
        // Store both response and role
        this.clients.get(id).push({ res, role });

        // 3. Send initial connection confirmation
        const initData = { message: "Connected to Real-time Events" };
        res.write(`data: ${JSON.stringify(initData)}\n\n`);

        console.log(`SSE Client Connected: ${id} (${role})`);

        // 4. Setup Keep-Alive (Heartbeat)
        const keepAliveInterval = setInterval(() => {
            res.write(': keepalive\n\n');
        }, 30000);

        // 5. Handle Disconnect
        req.on("close", () => {
            clearInterval(keepAliveInterval);
            console.log(`SSE Client Disconnected: ${id}`);
            const userConnections = this.clients.get(id);
            if (userConnections) {
                // Remove this specific connection object
                const index = userConnections.findIndex(conn => conn.res === res);
                if (index > -1) {
                    userConnections.splice(index, 1);
                }
                // If no more connections, delete key
                if (userConnections.length === 0) {
                    this.clients.delete(id);
                }
            }
        });
    }

    /**
     * Sends an event to a specific user and optionally persists it as a Notification.
     * @param {string} userId - Target User ID.
     * @param {string} type - Event type (e.g., "BID_UPDATE", "NEW_JOB").
     * @param {object} data - Data payload.
     * @param {boolean} saveToDb - Whether to save to database.
     */
    async sendToUser(userId, type, data, saveToDb = true) {
        const id = userId.toString();

        // 1. Persist to Database (if requested)
        if (saveToDb) {
            try {
                // Determine 'relatedId' from data if possible (e.g. jobId, taskId)
                const relatedId = data.jobId || data.taskId || data.relatedId || null;

                await Notification.create({
                    recipient: userId,
                    type: data.type || "SYSTEM", // Use specific type if inside data, else generic
                    message: data.message || "New Notification",
                    relatedId
                });
            } catch (error) {
                console.error("Failed to save notification:", error);
                // Non-blocking: continue to send real-time event
            }
        }

        // 2. Send Real-time Event
        const connections = this.clients.get(id);
        if (connections && connections.length > 0) {
            const payload = JSON.stringify(data);
            connections.forEach(conn => {
                conn.res.write(`event: ${type}\n`);
                conn.res.write(`data: ${payload}\n\n`);
            });
            return true;
        }
        return false;
    }

    /**
     * Broadcasts an event to ALL active connected users.
     * @param {string} type - Event type.
     * @param {object} data - Data payload.
     * @param {string} targetRole - Optional. "Freelancer" or "Client".
     */
    broadcast(type, data, targetRole = null) {
        const payload = JSON.stringify(data);
        this.clients.forEach((connections, userId) => {
            connections.forEach(conn => {
                // If targetRole is specified, only send if user matches
                if (targetRole && conn.role !== targetRole) {
                    return;
                }
                conn.res.write(`event: ${type}\n`);
                conn.res.write(`data: ${payload}\n\n`);
            });
        });
    }
}

export const sseManager = new SSEManager();
