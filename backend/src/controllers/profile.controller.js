import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("email username fullName role _id");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, bio, skills, portfolio } = req.body;

    // Validation
    if (!fullName?.trim()) throw new ApiError(400, "Full Name is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");

    // Prepare update object
    const updateData = {
        fullName,
        email,
        bio: bio || "",
        portfolio: portfolio || ""
    };

    // If skills are provided (as comma separated string or array), handle them
    if (skills) {
        if (Array.isArray(skills)) {
            updateData.skills = skills;
        } else {
            updateData.skills = skills.split(",").map(skill => skill.trim());
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updateData
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserProfileImage = asyncHandler(async (req, res) => {
    const profileImageLocalPath = req.file?.path;

    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile Image file is missing");
    }

    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

    if (!profileImage.url) {
        throw new ApiError(400, "Error while uploading profile image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                profileImage: profileImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile Image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID format (optional but good practice, though Mongoose usually handles casting)
    // Here retrieving FULL details (excluding sensitive auth data)
    const user = await User.findById(id).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    // If role is specified in query (e.g. ?role=Freelancer), filter by it.
    // If NOT specified, return ALL users.
    let { role } = req.query;

    const query = {};
    if (role) {
        // Normalize role: "freelancer" -> "Freelancer"
        role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

        // Enforce role validity if user passes garbage
        const allowedRoles = ["Freelancer", "Client"];
        if (allowedRoles.includes(role)) {
            query.role = role;
        } else {
            // Optional: throw error or just return empty/all?
            // "if not specified in url then all" implies loose filtering
            // but strict role checking is safer. Let's return empty if invalid role.
            query.role = role;
        }
    }

    const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: { createdAt: -1 } // Newest first
    };

    // Since we don't have aggregate paginate on User model yet, we'll use find + skip/limit
    // Or just simple find if scale corresponds to FYP
    // User requested "get all users", normally implies pagination but for now plain find is enough for MVP

    const users = await User.find(query).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const deleteUserProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (user.profileImage) {
        try {
            const urlParts = user.profileImage.split("/");
            const filenameWithExt = urlParts[urlParts.length - 1];
            const folder = urlParts[urlParts.length - 2];

            const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;

            await deleteFromCloudinary(publicId);
        } catch (error) {
            console.log("Error deleting profile image from Cloudinary:", error);
            // Optionally throw error, but usually better to proceed with DB clear
        }

        user.profileImage = "";
        await user.save({ validateBeforeSave: false });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile Image deleted successfully"));
});

const deleteUserCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (user.coverImage) {
        try {
            const urlParts = user.coverImage.split("/");
            const filenameWithExt = urlParts[urlParts.length - 1];
            const folder = urlParts[urlParts.length - 2];
            const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;

            await deleteFromCloudinary(publicId);
        } catch (error) {
            console.log("Error deleting cover image from Cloudinary:", error);
        }

        user.coverImage = "";
        await user.save({ validateBeforeSave: false });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image deleted successfully"));
});

export {
    getCurrentUser,
    updateAccountDetails,
    updateUserProfileImage,
    updateUserCoverImage,
    getAllUsers,
    getUserProfileById,
    deleteUserProfileImage,
    deleteUserCoverImage
};
