import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import { throwIfInvalid } from "../utils/validators.js";

const cookieOptions = {
    httpOnly: true,
    secure: true,
};

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, role } = req.body;

    // Use validator utility as requested
    throwIfInvalid(!fullName?.trim(), 400, "Full Name is required");
    throwIfInvalid(!email?.trim(), 400, "Email is required");
    throwIfInvalid(!username?.trim(), 400, "Username is required");
    throwIfInvalid(!password?.trim(), 400, "Password is required");

    // Role is now MANDATORY
    if (!role) {
        throw new ApiError(400, "Role is required (Client or Freelancer)");
    }

    const allowedRoles = ["Freelancer", "Client"];
    throwIfInvalid(!allowedRoles.includes(role), 400, "Invalid Role. Allowed: Freelancer, Client");

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    // No avatar/image upload during registration as requested

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        role,
        profileImage: "",
        coverImage: ""
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    throwIfInvalid(!username && !email, 400, "username or email is required");
    throwIfInvalid(!role, 400, "Role is required to login");

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Check if the user is trying to login with the correct role
    if (user.role !== role) {
        throw new ApiError(401, `Access Denied: You are registered as a ${user.role}, not a ${role}`);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    // User requested only basic data: email, username, full name
    // returning _id and role is also usually essential for frontend logic
    const user = await User.findById(req.user._id).select("email username fullName role _id");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Current user fetched successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // 1. Validation
    throwIfInvalid(!email?.trim(), 400, "Email is required to confirm deletion");
    throwIfInvalid(!password?.trim(), 400, "Password is required to confirm deletion");
    throwIfInvalid(!role, 400, "Role is required to confirm deletion");

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // 2. Security Checks
    if (user.email !== email) {
        throw new ApiError(400, "Email does not match your account");
    }

    if (user.role !== role) {
        throw new ApiError(400, "Role does not match your account");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password. Account deletion failed.");
    }

    // 3. User is Verified -> Delete
    // Perform cleanup or cascading deletes here if needed in future (e.g. jobs, messages)

    await User.findByIdAndDelete(req.user._id);

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email, bio, skills, portfolio } = req.body;

    // Validation
    throwIfInvalid(!fullName?.trim(), 400, "Full Name is required");
    throwIfInvalid(!email?.trim(), 400, "Email is required");

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

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    throwIfInvalid(!oldPassword || !newPassword, 400, "Old and New password are required");
    throwIfInvalid(oldPassword === newPassword, 400, "Old and New password cannot be same");

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const deleteUserProfileImage = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password -refreshToken");

    if (user.profileImage) {
        try {
            // Extract publicId: URL is .../folder/filename.ext
            // We need folder/filename
            const urlParts = user.profileImage.split("/");
            const filenameWithExt = urlParts[urlParts.length - 1]; // filename.jpg
            const folder = urlParts[urlParts.length - 2]; // Project-00

            // Basic extraction (might need refinement if URL structure varies)
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
    registerUser,
    loginUser,
    logoutUser,
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
    deleteUserCoverImage
};
