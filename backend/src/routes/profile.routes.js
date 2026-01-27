import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

// All Profile routes require authentication
router.use(verifyJWT);

// --- PROFILE ROUTES ---

router.route("/me").get(getCurrentUser);
router.route("/").get(getAllUsers); // List users

// Profile Updates
router.route("/profile").patch(updateAccountDetails);
router.route("/profile/:id").get(getUserProfileById);

// Image Handling
router.route("/profile/image")
    .patch(upload.single("profileImage"), updateUserProfileImage)
    .delete(deleteUserProfileImage);

router.route("/profile/cover")
    .patch(upload.single("coverImage"), updateUserCoverImage)
    .delete(deleteUserCoverImage);

export default router;
