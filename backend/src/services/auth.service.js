import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { parseDuration } from "../utils/time.utils.js";
import crypto from "crypto";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "../constants.js";
import { ValidationHelper } from "../utils/validation.utils.js";

/**
 * AuthService handles business and system logic for authentication.
 * Relieves the controller of technical overhead like token signing and cookie config.
 */
class AuthService {
    /**
     * Generates standard cookie options based on environment.
     */
    static getCookieOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };
    }

    /**
     * Returns maxAge for cookies in milliseconds.
     */
    static getCookieMaxAges() {
        return {
            accessTokenMaxAge: parseDuration(ACCESS_TOKEN_EXPIRY),
            refreshTokenMaxAge: parseDuration(REFRESH_TOKEN_EXPIRY)
        };
    }

    /**
     * Generates both Access and Refresh tokens and saves Refresh token to DB.
     * @param {string} userId
     */
    static async generateAccessAndRefreshTokens(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) throw new ApiError(404, "User not found during token generation");

            const accessToken = user.generateAccessToken();
            const refreshToken = user.generateRefreshToken();

            user.refreshToken = refreshToken;
            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken };
        } catch (error) {
            throw new ApiError(500, error.message || "Failed to generate session tokens");
        }
    }

    /**
     * Handles the complex logic of Google OAuth profile reconciliation.
     * Links existing accounts or creates new ones with randomized credentials.
     * @param {object} profile - Passport Google Profile
     * @param {string} requestedRole - Role from state (Client/Freelancer)
     */
    static async processGoogleAuth(profile, requestedRole) {
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const fullName = profile.displayName;
        const profileImage = profile.photos?.[0]?.value;

        if (ValidationHelper.isEmpty(email)) throw new ApiError(400, "Email not found in Google profile");

        let user = await User.findOne({
            $or: [{ googleId }, { email }]
        });

        if (user) {
            if (ValidationHelper.isEmpty(user.googleId)) {
                user.googleId = googleId;
                if (ValidationHelper.isEmpty(user.profileImage)) user.profileImage = profileImage;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            const randomPassword = crypto.randomBytes(20).toString("hex");
            const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-0]/g, "");
            const uniqueUsername = `${baseUsername}_${crypto.randomInt(1000, 9999)}`;

            user = await User.create({
                fullName,
                email,
                username: uniqueUsername,
                password: randomPassword,
                googleId,
                role: requestedRole || "Client",
                profileImage,
                coverImage: ""
            });
        }

        return user;
    }
}

export { AuthService };
