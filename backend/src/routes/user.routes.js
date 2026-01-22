import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
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

import {
    getCurrentUser,
    updateAccountDetails,
    updateUserProfileImage,
    updateUserCoverImage,
    getAllUsers,
    getUserProfileById,
    deleteUserProfileImage,
    deleteUserCoverImage
} from "../controllers/profile.controller.js";

const router = Router();



// --- AUTH ROUTES ---

// Public Auth
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

// Secured Auth
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/password/change").patch(verifyJWT, changeCurrentPassword);
router.route("/delete-account").delete(verifyJWT, deleteUser);


// --- PROFILE ROUTES (Secured) ---

router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/").get(verifyJWT, getAllUsers); // List users

// Profile Updates
router.route("/profile").patch(verifyJWT, updateAccountDetails);
router.route("/profile/:id").get(verifyJWT, getUserProfileById);

// Image Handling
router.route("/profile/image")
    .patch(verifyJWT, upload.single("profileImage"), updateUserProfileImage)
    .delete(verifyJWT, deleteUserProfileImage);

router.route("/profile/cover")
    .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)
    .delete(verifyJWT, deleteUserCoverImage);

export default router;
