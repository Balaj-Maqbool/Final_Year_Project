import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { CORS_ORIGIN } from "./constants.js";

const app = express();

app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

app.use(express.json({ limit: "24kb" }));

app.use(
    express.urlencoded({
        limit: "24kb",
        extended: true,
    })
);

app.use(express.static("public"));
app.use(cookieParser());

// router imports

import { router as userRoutes } from "../../routes/user.routes.js";
import { router as videoRoutes } from "../../routes/video.routes.js";
import { router as playlistRoutes } from "../../routes/playList.routes.js";
import { router as subscriptionRouter } from "../../routes/subscription.routes.js";
import { router as commentRoutes } from "../../routes/comment.routes.js";
import { router as tweetRoutes } from "../../routes/tweet.routes.js";
import { router as likeRoutes } from "../../routes/like.routes.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/playlists", playlistRoutes);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/likes", likeRoutes);

// http://localhost:3000/api/v1/users/register
// http://localhost:3000/api/v1/users/login

export { app };
