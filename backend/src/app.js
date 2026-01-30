import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGIN } from "./constants.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import 'dotenv/config'
const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
);

app.use(express.json({ limit: "24kb" }));

app.use(express.static("public"));
app.use(cookieParser());

import passport from "passport";
import "./config/passport.js";
app.use(passport.initialize());


import authRouter from "./routes/auth.routes.js";
import profileRouter from "./routes/profile.routes.js";

app.use("/api/v1/users", authRouter);
app.use("/api/v1/users", profileRouter);

import jobRouter from "./routes/job.routes.js";
app.use("/api/v1/jobs", jobRouter);

import bidRouter from "./routes/bid.routes.js";
app.use("/api/v1/bids", bidRouter);

import ratingRouter from "./routes/rating.routes.js";
app.use("/api/v1/ratings", ratingRouter);


import taskRouter from "./routes/task.routes.js";
app.use("/api/v1/tasks", taskRouter);

import dashboardRouter from "./routes/dashboard.routes.js";
app.use("/api/v1/dashboard", dashboardRouter);

import notificationRouter from "./routes/notification.routes.js";
app.use("/api/v1/notifications", notificationRouter);

import streamRouter from "./routes/stream.routes.js";
app.use("/api/v1/stream", streamRouter);

import chatRouter from "./routes/chat.routes.js";
app.use("/api/v1/chats", chatRouter);


app.get("/", (req, res) => {
    res.send("API is running...");
});


app.use((err, req, res, next) => {
    console.error("Global Error Handler Catch:", err);
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json(
            new ApiResponse(err.statusCode, null, err.message)
        );
    }

    if (err.name === 'ValidationError') {
        return res.status(400).json(
            new ApiResponse(400, null, err.message)
        );
    }


    return res.status(500).json(
        new ApiResponse(500, null, "Internal Server Error: " + err.message)
    );
});

export { app };
