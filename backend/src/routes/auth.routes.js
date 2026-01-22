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
    handleGoogleCallback
} from "../controllers/auth.controller.js";

const router = Router();

// --- PUBLIC AUTH ROUTES ---

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/refresh-token").post(refreshAccessToken);

// Google Auth
router.route("/google").get((req, res, next) => {
    const role = req.query.role || "Client";
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: role
    })(req, res, next);
});

router.route("/google/callback").get(
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    handleGoogleCallback
);

// --- SECURED AUTH ROUTES ---

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/password/change").patch(verifyJWT, changeCurrentPassword);
router.route("/delete-account").delete(verifyJWT, deleteUser);

export default router;
