import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";

import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    deleteUser,
    handleGoogleCallback,
<<<<<<< HEAD
    getCurrentUser
=======
    forgotPassword,
    resetPassword
>>>>>>> f4fb3595c067c834428ac2092d67150009b7ce22
} from "../controllers/auth.controller.js";

import { RateLimitManager } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router.route("/register").post(RateLimitManager.apiAuth(), registerUser);
router.route("/login").post(RateLimitManager.apiAuth(), loginUser);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/google").get((req, res, next) => {
    const role = req.query.role || "Client";
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: role
    })(req, res, next);
});

router.route("/google/callback").get(
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}${process.env.FRONTEND_LOGIN_PATH || "/login"}`
    }),
    handleGoogleCallback
);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/password/change").patch(verifyJWT, changeCurrentPassword);
router.route("/delete-account").delete(verifyJWT, deleteUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router
    .route("/password/forgot")
    .post(RateLimitManager.apiAuth(), forgotPassword);
router
    .route("/password/reset/:token")
    .patch(RateLimitManager.apiAuth(), resetPassword);

export default router;
