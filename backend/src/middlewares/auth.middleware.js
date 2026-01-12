import { ACCESS_TOKEN_SECRET } from "../constants.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { trycatchAsyncHandler as asyncHandler } from "../utils/AsyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandler(async (req, res, next) => {
    const accessToken =
        (await req.cookies?.accessToken) || req.header("Authorization")?.replace("Bearer ", "");
    if (!accessToken) {
        throw new ApiError(401, "Unauthorized Access, Token expired");
    }
    const decodedToken = jwt.verify(accessToken, ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
        throw new ApiError(500, "Internal Server Error");
    }

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    if (!user) {
        throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
});

export { verifyJWT };
