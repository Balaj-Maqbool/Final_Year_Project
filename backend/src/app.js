import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGIN } from "./constants.js";
import { ApiError } from "./utils/ApiError.js";
import { ApiResponse } from "./utils/ApiResponse.js";
import "dotenv/config";
const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    })
);

app.use((req, res, next) => {
    res.setHeader("X-Powered-By", "Balaj-Maqbool-Backend-Engine");
    next();
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(
            `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`
        );
    });
    next();
});

import { RateLimitManager } from "./middlewares/rateLimiter.middleware.js";
app.use("/api", RateLimitManager.apiGlobal());

// Stripe Webhook MUST be parsed as raw body before express.json()
import { stripeWebhook } from "./controllers/payment.controller.js";
app.post(
    "/api/v1/payments/webhook",
    express.raw({ type: "application/json" }),
    stripeWebhook
);

app.use(express.json({ limit: "24kb" }));

app.use(express.static("public"));
app.use(cookieParser());

import passport from "passport";
import "./config/passport.config.js";
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

import mediaRouter from "./routes/media.routes.js";
app.use("/api/v1/media", mediaRouter);

import aiRouter from "./routes/ai.routes.js";
app.use("/api/v1/ai", aiRouter);

import paymentRouter from "./routes/payment.routes.js";
app.use("/api/v1/payments", paymentRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        status: "Healthy",
        project: "Freelance Marketplace Master API",
        author: "Balaj Maqbool",
        version: "1.0.0",
        contact: "balajmaqbool54@gmail.com",
        portfolio: "https://balaj-maqbool.vercel.app/"
    });
});

app.use((err, req, res, next) => {
    console.error("Global Error Handler Catch:", err);
    if (err instanceof ApiError) {
        return res
            .status(err.statusCode)
            .json(new ApiResponse(err.statusCode, null, err.message));
    }

    if (err.name === "ValidationError") {
        return res.status(400).json(new ApiResponse(400, null, err.message));
    }

    return res
        .status(500)
        .json(
            new ApiResponse(500, null, "Internal Server Error: " + err.message)
        );
});

export { app };
