import { asyncHandler } from "../utils/AsyncHandler.js";
import { sseManager } from "../utils/SSEManager.js";
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
    sseManager.addClient(req.user._id, req.user.role, res, req);

    // Handle client disconnect on the request (extra safety, though SSEManager handles res.on('close'))
    req.on("close", () => {
        // The SSEManager removes the client automatically on res close,
        // but we can log here if needed for debug.
    });
});

export { streamEvents };
