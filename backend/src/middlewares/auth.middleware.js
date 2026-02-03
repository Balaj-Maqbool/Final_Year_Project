import { ACCESS_TOKEN_SECRET } from "../constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { ValidationHelper } from "../utils/validation.utils.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const accessToken = (await req.cookies?.accessToken) || req.header("Authorization")?.replace("Bearer ", "");
    if (ValidationHelper.isEmpty(accessToken)) {
        throw new ApiError(401, "Unauthorized Access, Token expired");
    }
    try {
        const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!req.user) {
            throw new ApiError(401, "Invalid Access Token");
        }
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export { verifyJWT };
