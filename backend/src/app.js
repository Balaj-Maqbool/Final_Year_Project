import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGIN } from "./constants.js";
import 'dotenv/config'
const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(express.json({ limit: "24kb" }));

app.use(express.static("public"));
app.use(cookieParser());

import passport from "passport";
import "./passport/passport.config.js";
app.use(passport.initialize());

// router imports
import userRouter from "./routes/user.routes.js";
app.use("/api/v1/users", userRouter);

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

export { app };
