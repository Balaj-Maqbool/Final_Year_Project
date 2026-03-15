import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import {
    REFRESH_TOKEN_SECRET,
    FRONTEND_URL,
    FRONTEND_RESET_PASSWORD_PATH,
    FRONTEND_OAUTH_SUCCESS_PATH
} from "../constants.js";
import { AuthService } from "../services/auth.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";
import { CloudinaryHelper } from "../utils/cloudinary.utils.js";
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
import sendEmail from "../utils/sendEmail.js";
import {
    getPasswordResetTemplate,
    getWelcomeEmailTemplate
} from "../utils/emailTemplates.js";
import { Job } from "../models/job.model.js";
import { Bid } from "../models/bid.model.js";
import { ChatThread } from "../models/chat.model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, role } = req.body;

    ValidationHelper.validateLength(fullName, 2, 50, "Full Name");
    ValidationHelper.validateEmail(email);
    ValidationHelper.validateLength(username, 3, 30, "Username");
    ValidationHelper.validateLength(password, 8, 128, "Password");
    ValidationHelper.validatePasswordStrength(password);
    if (!["Freelancer", "Client"].includes(role)) {
        throw new ApiError(400, "Role must be 'Client' or 'Freelancer'");
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail)
        throw new ApiError(409, "User with this email already exists");

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
        throw new ApiError(409, "User with this username already exists");

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        role,
        profileImage: "",
        coverImage: ""
    });

    const createdUser = await User.findById(user._id);

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    try {
        await sendEmail({
            email: createdUser.email,
            subject: "Welcome to Freelance Market! 🚀",
            html: getWelcomeEmailTemplate({
                name: createdUser.fullName || createdUser.username,
                role: createdUser.role
            })
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    if (ValidationHelper.isEmpty(username) && ValidationHelper.isEmpty(email)) {
        throw new ApiError(400, "Username or Email is required");
    }
    if (ValidationHelper.isEmpty(role))
        throw new ApiError(400, "Role is required to login");

    let user;
    if (!ValidationHelper.isEmpty(email)) {
        user = await User.findOne({ email });
        if (!user)
            throw new ApiError(404, "User with this email does not exist");
    }
    if (!ValidationHelper.isEmpty(username)) {
        user = await User.findOne({ username });
        if (!user)
            throw new ApiError(404, "User with this username does not exist");
    }

    if (user.role !== role) {
        throw new ApiError(
            401,
            `Access Denied: You are registered as a ${user.role}, not a ${role}`
        );
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }

    const { accessToken, refreshToken } =
        await AuthService.generateAccessAndRefreshTokens(user._id);
    const { accessTokenMaxAge, refreshTokenMaxAge } =
        AuthService.getCookieMaxAges();
    const options = AuthService.getCookieOptions();

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: accessTokenMaxAge
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: refreshTokenMaxAge
        })
        .json(new ApiResponse(200, { user }, "User logged In Successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = AuthService.getCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    console.log("Refresh token attempt. Cookie present:", !!req.cookies.refreshToken, "Body present:", !!req.body.refreshToken);

    if (!incomingRefreshToken) {
        console.error("No refresh token provided");
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            REFRESH_TOKEN_SECRET
        );
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            console.error("User not found for refresh token");
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            console.error("Refresh token mismatch");
            throw new ApiError(401, "Expired or used refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } =
            await AuthService.generateAccessAndRefreshTokens(user._id);
        const { accessTokenMaxAge, refreshTokenMaxAge } =
            AuthService.getCookieMaxAges();
        const options = AuthService.getCookieOptions();

        return res
            .status(200)
            .cookie("accessToken", accessToken, {
                ...options,
                maxAge: accessTokenMaxAge
            })
            .cookie("refreshToken", newRefreshToken, {
                ...options,
                maxAge: refreshTokenMaxAge
            })
            .json(new ApiResponse(200, {}, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (
        ValidationHelper.isEmpty(oldPassword) ||
        ValidationHelper.isEmpty(newPassword)
    ) {
        throw new ApiError(400, "Old and New password are required");
    }

    const user = await User.findById(req.user._id);
    if (!(await user.isPasswordCorrect(oldPassword))) {
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
    const user = await User.findById(req.user._id);

    if (
        !user ||
        user.email !== email ||
        user.role !== role ||
        !(await user.isPasswordCorrect(password))
    ) {
        throw new ApiError(
            401,
            "Authentication failed. Account deletion denied."
        );
    }

    if (user.role === "Client") {
        const activeJobsCount = await Job.countDocuments({
            poster_id: user._id,
            status: { $in: ["Assigned"] }
        });
        if (activeJobsCount > 0) {
            throw new ApiError(
                400,
                `Cannot delete account. You have ${activeJobsCount} active job(s) in progress. Please complete or close them first.`
            );
        }

        const openJobs = await Job.find({
            poster_id: user._id,
            status: "Open"
        }).select("_id");
        const openJobIds = openJobs.map((job) => job._id);

        if (openJobIds.length > 0) {
            await Bid.deleteMany({ job_id: { $in: openJobIds } });

            await ChatThread.deleteMany({ jobId: { $in: openJobIds } });

            await Job.deleteMany({ _id: { $in: openJobIds } });
        }
    }

    if (user.role === "Freelancer") {
        const activeWorkCount = await Job.countDocuments({
            assigned_to: user._id,
            status: "Assigned"
        });
        if (activeWorkCount > 0) {
            throw new ApiError(
                400,
                `Cannot delete account. You are currently assigned to ${activeWorkCount} active job(s). Please complete them first.`
            );
        }

        await Bid.deleteMany({ user_id: user._id });
    }

    if (user.profileImage) {
        await CloudinaryHelper.safeDelete(user.profileImage);
    }
    if (user.coverImage) {
        await CloudinaryHelper.safeDelete(user.coverImage);
    }

    await User.findByIdAndDelete(req.user._id);
    const options = AuthService.getCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User deleted successfully"));
});

const handleGoogleCallback = asyncHandler(async (req, res) => {
    const profile = req.user;
    const requestedRole = req.query.state || "Client";

    if (!profile) throw new ApiError(400, "Google Authentication Failed");

    const user = await AuthService.processGoogleAuth(profile, requestedRole);
    const { accessToken, refreshToken } =
        await AuthService.generateAccessAndRefreshTokens(user._id);

    const { accessTokenMaxAge, refreshTokenMaxAge } =
        AuthService.getCookieMaxAges();
    const options = AuthService.getCookieOptions();
    const frontendUrl = FRONTEND_URL || "http://localhost:5173";

    return res
        .status(200)
        .cookie("accessToken", accessToken, {
            ...options,
            maxAge: accessTokenMaxAge
        })
        .cookie("refreshToken", refreshToken, {
            ...options,
            maxAge: refreshTokenMaxAge
        })
        .redirect(
            `${frontendUrl}${FRONTEND_OAUTH_SUCCESS_PATH || "/oauth-success"}?success=true&role=${user.role}`
        );
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    ValidationHelper.validateEmail(email);

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User not found");

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });
    const frontendUrl = FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}${FRONTEND_RESET_PASSWORD_PATH || "/reset-password"}/${resetToken}`;

    const message = getPasswordResetTemplate(resetUrl);

    try {
        await sendEmail({
            email: user.email,
            subject: "Password Reset Request",
            message: `You requested a password reset. Please go to this link: ${resetUrl}`,
            html: message
        });

        res.status(200).json(new ApiResponse(200, {}, "Email sent"));
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        throw new ApiError(500, "Email could not be sent");
    }
});

const resetPassword = asyncHandler(async (req, res) => {
    const resetPasswordToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) throw new ApiError(400, "Invalid Reset Token");

    const { password: newPassword } = req.body;
    ValidationHelper.validateLength(newPassword, 8, 128, "Password");
    ValidationHelper.validatePasswordStrength(newPassword);

    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(
            400,
            "New password cannot be the same as the old password"
        );
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json(
        new ApiResponse(200, {}, "Password Reset Successfully")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    deleteUser,
    handleGoogleCallback,
    forgotPassword,
    resetPassword // exported
};
