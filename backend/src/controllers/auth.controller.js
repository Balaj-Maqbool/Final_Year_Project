import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_SECRET } from "../constants.js";
import { AuthService } from "../services/auth.service.js";
import { ValidationHelper } from "../utils/validation.utils.js";

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, role } = req.body;


    if (ValidationHelper.isEmpty(fullName)) throw new ApiError(400, "Full Name is required");
    if (ValidationHelper.isEmpty(email)) throw new ApiError(400, "Email is required");
    if (ValidationHelper.isEmpty(username)) throw new ApiError(400, "Username is required");
    if (ValidationHelper.isEmpty(password)) throw new ApiError(400, "Password is required");

    if (!["Freelancer", "Client"].includes(role)) {
        throw new ApiError(400, "Role must be 'Client' or 'Freelancer'");
    }


    const existingEmail = await User.findOne({ email });
    if (existingEmail) throw new ApiError(409, "User with this email already exists");

    const existingUsername = await User.findOne({ username });
    if (existingUsername) throw new ApiError(409, "User with this username already exists");

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
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password, role } = req.body;

    if (ValidationHelper.isEmpty(username) && ValidationHelper.isEmpty(email)) {
        throw new ApiError(400, "Username or Email is required");
    }
    if (ValidationHelper.isEmpty(role)) throw new ApiError(400, "Role is required to login");

    let user;
    if (!ValidationHelper.isEmpty(email)) {
        user = await User.findOne({ email });
        if (!user) throw new ApiError(404, "User with this email does not exist");
    }
    if (!ValidationHelper.isEmpty(username)) {
        user = await User.findOne({ username });
        if (!user) throw new ApiError(404, "User with this username does not exist");
    }

    if (user.role !== role) {
        throw new ApiError(401, `Access Denied: You are registered as a ${user.role}, not a ${role}`);
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password");
    }

    const { accessToken, refreshToken } = await AuthService.generateAccessAndRefreshTokens(user._id);
    const { accessTokenMaxAge, refreshTokenMaxAge } = AuthService.getCookieMaxAges();
    const options = AuthService.getCookieOptions();

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: accessTokenMaxAge })
        .cookie("refreshToken", refreshToken, { ...options, maxAge: refreshTokenMaxAge })
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
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user || incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid or expired refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } = await AuthService.generateAccessAndRefreshTokens(user._id);
        const { accessTokenMaxAge, refreshTokenMaxAge } = AuthService.getCookieMaxAges();
        const options = AuthService.getCookieOptions();

        return res
            .status(200)
            .cookie("accessToken", accessToken, { ...options, maxAge: accessTokenMaxAge })
            .cookie("refreshToken", newRefreshToken, { ...options, maxAge: refreshTokenMaxAge })
            .json(new ApiResponse(200, {}, "Access token refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (ValidationHelper.isEmpty(oldPassword) || ValidationHelper.isEmpty(newPassword)) {
        throw new ApiError(400, "Old and New password are required");
    }

    const user = await User.findById(req.user._id);
    if (!(await user.isPasswordCorrect(oldPassword))) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || user.email !== email || user.role !== role || !(await user.isPasswordCorrect(password))) {
        throw new ApiError(401, "Authentication failed. Account deletion denied.");
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
    const { accessToken, refreshToken } = await AuthService.generateAccessAndRefreshTokens(user._id);

    const { accessTokenMaxAge, refreshTokenMaxAge } = AuthService.getCookieMaxAges();
    const options = AuthService.getCookieOptions();
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    return res
        .status(200)
        .cookie("accessToken", accessToken, { ...options, maxAge: accessTokenMaxAge })
        .cookie("refreshToken", refreshToken, { ...options, maxAge: refreshTokenMaxAge })
        .redirect(`${frontendUrl}/oauth-success`);
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
