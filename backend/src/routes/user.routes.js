import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";

import {
    loginUser,
    logoutUser,
    registerUser,
    refreshAccessToken,
    getCurrentUser,
    deleteUser,
    updateAccountDetails,
    updateUserProfileImage,
    updateUserCoverImage,
    getAllUsers,
    getUserProfileById,
    changeCurrentPassword,
    deleteUserProfileImage,
    deleteUserCoverImage,
    handleGoogleCallback
} from "../controllers/user.controller.js";

const router = Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

router
    .route("/google")
    .get(
        (req, res, next) => {
            const role = req.query.role || "Client";
            passport.authenticate("google", {
                scope: ["profile", "email"],
                state: role // Pass role as state
            })(req, res, next);
        });

router
    .route("/google/callback")
    .get(
        passport.authenticate("google", { session: false, failureRedirect: "/login" }),
        handleGoogleCallback
    );



// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);
router.route("/delete-account").delete(verifyJWT, deleteUser);
router.route("/profile").patch(verifyJWT, updateAccountDetails);
router.route("/profile/:id").get(verifyJWT, getUserProfileById);


router
    .route("/profile/image")
    .patch(
        verifyJWT,
        upload.single("profileImage"),
        updateUserProfileImage
    );

router.route("/profile/cover").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateUserCoverImage
);

router.route("/password/change").patch(verifyJWT, changeCurrentPassword);
router.route("/profile/image").delete(verifyJWT, deleteUserProfileImage);
router.route("/profile/cover").delete(verifyJWT, deleteUserCoverImage);

router.route("/").get(verifyJWT, getAllUsers);

export default router;
