import { Router } from "express";
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
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.get(
    "/google",
    (req, res, next) => {
        const role = req.query.role || "Client";
        passport.authenticate("google", {
            scope: ["profile", "email"],
            state: role // Pass role as state
        })(req, res, next);
    }
);

router.get(
    "/google/callback",
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


router.route("/profile/image").patch(
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

// Get All Users (Admin or Public? User didn't specify security for this one, but usually requires login on typical platforms)
// "get all users depending upon the role specified on path"
// Assuming public or authenticated. Let's make it authenticated to be safe.
router.route("/").get(verifyJWT, getAllUsers);

export default router;
