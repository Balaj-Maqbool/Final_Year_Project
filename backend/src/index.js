import http from "http";
import { PORT } from "./constants.js";
import { app } from "./app.js";
import connectDB from "./config/db.js";
import { socketManager } from "./streams/socket.js";
connectDB()
    .then(() => {
        const server = http.createServer(app);

        // Initialize Socket.io
        socketManager.initialize(server);

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


