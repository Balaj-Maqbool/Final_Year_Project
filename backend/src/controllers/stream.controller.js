import { asyncHandler } from "../utils/AsyncHandler.js";
import { sseManager } from "../streams/SSEManager.js";
import { ApiError } from "../utils/ApiError.js";

const streamEvents = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized: User not identified");
    }

    sseManager.registerConnection(req.user._id, req.user.role, res, req);
});

export { streamEvents };
