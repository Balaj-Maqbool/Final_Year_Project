import { asyncHandler } from "../utils/AsyncHandler.js";
import { sseManager } from "../streams/SSEManager.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * @desc    Establish a Real-Time Stream (SSE)
 * @route   GET /api/v1/stream/connect
 * @access  Private
 */
const streamEvents = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(401, "Unauthorized: User not identified");
    }

    // Pass the response object to SSEManager to handle headers and connection
    sseManager.registerConnection(req.user._id, req.user.role, res, req);
});

export { streamEvents };
