import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { CloudinaryHelper } from "../utils/cloudinary.utils.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { CLOUDINARY_ROOT_FOLDER } from "../constants.js";

const getCurrentUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, bio, skills, portfolio } = req.body;

    const updateData = {};

    if (fullName !== undefined) {
        ValidationHelper.validateLength(fullName, 2, 50, "Full Name");
        updateData.fullName = fullName;
    }

    if (email !== undefined) {
        ValidationHelper.validateEmail(email);
        if (email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new ApiError(
                    409,
                    "Email is already in use by another account"
                );
            }
        }
        updateData.email = email;
    }

    if (bio !== undefined) {
        ValidationHelper.validateLength(bio, 0, 500, "Bio");
        updateData.bio = bio;
    }

    if (portfolio !== undefined) {
        ValidationHelper.validateLength(
            portfolio,
            0,
            2000,
            "Portfolio URL/Text"
        );
        updateData.portfolio = portfolio;
    }

    if (skills !== undefined) {
        let skillsArray = [];
        if (Array.isArray(skills)) {
            skillsArray = skills;
        } else if (typeof skills === "string") {
            skillsArray = skills
                .split(",")
                .map((skill) => skill.trim())
                .filter((s) => s !== "");
        }

        if (skillsArray.length > 50)
            throw new ApiError(400, "Max 50 skills allowed");
        updateData.skills = skillsArray;
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: updateData
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

const updateUserProfileImage = asyncHandler(async (req, res) => {
    const profileImageLocalPath = req.file?.path;

    if (!profileImageLocalPath) {
        throw new ApiError(400, "Profile Image file is missing");
    }

    const profileImage = await CloudinaryHelper.upload(
        profileImageLocalPath,
        `${CLOUDINARY_ROOT_FOLDER}/Users/${req.user._id}/Profile`
    );

    if (!profileImage.secure_url) {
        throw new ApiError(400, "Error while uploading profile image");
    }

    if (req.user.profileImage) {
        await CloudinaryHelper.safeDelete(req.user.profileImage);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                profileImage: profileImage.secure_url
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile Image updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing");
    }

    const coverImage = await CloudinaryHelper.upload(
        coverImageLocalPath,
        `${CLOUDINARY_ROOT_FOLDER}/Users/${req.user._id}/Cover`
    );

    if (!coverImage.secure_url) {
        throw new ApiError(400, "Error while uploading cover image");
    }

    if (req.user.coverImage) {
        await CloudinaryHelper.safeDelete(req.user.coverImage);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.secure_url
            }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserProfileById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    ValidationHelper.validateId(id, "Invalid User ID");

    const user = await User.findById(id).select(
        "-email -refreshToken -password -googleId -resetPasswordToken -resetPasswordExpire"
    );

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    let { role } = req.query;

    const query = {};
    if (!ValidationHelper.isEmpty(role)) {
        query.role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }

    const users = await User.find(query).select(
        "-email -refreshToken -password -googleId -resetPasswordToken -resetPasswordExpire"
    );

    return res
        .status(200)
        .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const deleteUserProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.profileImage) {
        await CloudinaryHelper.safeDelete(user.profileImage);
        user.profileImage = "";
        await user.save({ validateBeforeSave: false });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile Image deleted successfully"));
});

const deleteUserCoverImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.coverImage) {
        await CloudinaryHelper.safeDelete(user.coverImage);
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
    deleteUserCoverImage // exported
};
