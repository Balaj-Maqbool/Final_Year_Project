import http from "http";
import { PORT } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/db.js";

import { WebSocketServer } from "ws";
import { chatManager } from "./socket/ChatManager.js";

connectDB()
    .then(() => {
        const server = http.createServer(app);

        // Style A: Explicit WebSocket Server with no auto-attach
        const wss = new WebSocketServer({ noServer: true });

        // Global WSS Error Handler
        wss.on("error", (err) => {
            console.error("Global WebSocket Server Error:", err);
        });

        // Handle the 'upgrade' event for custom authentication
        server.on("upgrade", async (nodeReq, socket, head) => {
            console.log("WS Upgrade Request Received");

            // 1. Authenticate the user from cookies
            const user = await chatManager.authenticate(nodeReq);

            if (!user) {
                console.log("WS Upgrade Denied: Unauthorized");
                socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
                socket.destroy();
                return;
            }

            // 2. If authenticated, complete the handshake
            wss.handleUpgrade(nodeReq, socket, head, (ws) => {
                wss.emit("connection", ws, nodeReq, user);
            });
        });

        // Handle successful connections
        wss.on("connection", (ws, nodeReq, user) => {
            chatManager.onConnect(ws, user);
        });

        server.on("error", (error) => {
            console.log("Server Connection Error !!! ", error);
        });

        server.listen(PORT, () => {
            console.log(`server listening at the Port : ${PORT}`);
        });

    })
    .catch((error) => {
        console.log("DB Connection Failed !!!", error);
    });


