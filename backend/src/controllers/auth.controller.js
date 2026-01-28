import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import crypto from "crypto";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
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
    if (!fullName?.trim()) throw new ApiError(400, "Full Name is required");
    if (!email?.trim()) throw new ApiError(400, "Email is required");
    if (!username?.trim()) throw new ApiError(400, "Username is required");
    if (!password?.trim()) throw new ApiError(400, "Password is required");

    if (!role) {
        throw new ApiError(400, "Role is required (Client or Freelancer)");
    }

    const allowedRoles = ["Freelancer", "Client"];
    if (!allowedRoles.includes(role)) throw new ApiError(400, "Invalid Role. Allowed: Freelancer, Client");

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }



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

    if (!username && !email) throw new ApiError(400, "username or email is required");
    if (!role) throw new ApiError(400, "Role is required to login");

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
                    user: loggedInUser
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

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(new ApiResponse(
                200,
                {},
                "Access token refreshed"
            ));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) throw new ApiError(400, "Old and New password are required");
    if (oldPassword === newPassword) throw new ApiError(400, "Old and New password cannot be same");

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

const deleteUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;

    // 1. Validation
    if (!email?.trim()) throw new ApiError(400, "Email is required to confirm deletion");
    if (!password?.trim()) throw new ApiError(400, "Password is required to confirm deletion");
    if (!role) throw new ApiError(400, "Role is required to confirm deletion");

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

const handleGoogleCallback = asyncHandler(async (req, res) => {
    // req.user is the profile returned from Passport Strategy
    const profile = req.user;
    const role = req.query.state || "Client"; // Get role from state, default to Client

    if (!profile) {
        throw new ApiError(400, "Google Authentication Failed");
    }
    console.log(profile);

    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const fullName = profile.displayName;
    const profileImage = profile.photos?.[0]?.value;

    if (!email) {
        throw new ApiError(400, "Email not found in Google Profile");
    }

    // 1. Check if user exists
    let user = await User.findOne({
        $or: [{ googleId }, { email }]
    });

    if (user) {
        // User exists
        if (!user.googleId) {
            // Link account if email matches but no googleId
            user.googleId = googleId;
            // Optionally update profile image if empty
            if (!user.profileImage) user.profileImage = profileImage;
            await user.save({ validateBeforeSave: false });
        }
    } else {
        // Create new user
        // Generate random password
        const randomPassword = crypto.randomBytes(20).toString("hex");

        // Generate unique username
        const baseUsername = email.split("@")[0];
        const uniqueUsername = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;

        user = await User.create({
            fullName,
            email,
            username: uniqueUsername,
            password: randomPassword,
            googleId,
            role, // Use the role passed in state
            profileImage,
            coverImage: ""
        });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Redirect to frontend
    // Use an env variable for frontend URL in production
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    // SECURITY UPDATE: Set tokens in HttpOnly cookies instead of URL
    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .redirect(`${frontendUrl}/oauth-success`); // No tokens in URL
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    deleteUser,
    handleGoogleCallback
};
