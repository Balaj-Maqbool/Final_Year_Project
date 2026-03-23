import http from "http";
import { PORT } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./config/db.config.js";
import { socketManager } from "./streams/SocketManager.js";
connectDB()
    .then(() => {
        const server = http.createServer(app);

        socketManager.initialize(server);

        let currentPort = parseInt(PORT, 10);

        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.log(`Port ${currentPort} is busy, deploying on port ${currentPort + 1}...`);
                currentPort++;
                server.listen(currentPort);
            } else {
                console.log("Server Connection Error !!! ", error);
            }
        });

        server.on("listening", () => {
            console.log(`server listening at the Port : ${currentPort}`);
        });

        server.listen(currentPort);
    })
    .catch((error) => {
        console.log("DB Connection Failed !!!", error);
    });
