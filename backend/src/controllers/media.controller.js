import { v2 as cloudinary } from "cloudinary";
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_ROOT_FOLDER } from "../constants.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateUploadSignature = asyncHandler(async (req, res) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const { folderType, threadId } = req.query;

    let folder = `${CLOUDINARY_ROOT_FOLDER}/General`;

    // Dynamic Folder Logic
    if (folderType === "chat" && threadId) {
        folder = `${CLOUDINARY_ROOT_FOLDER}/Chat/${threadId}`;
    } 

    const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
    }, CLOUDINARY_API_SECRET);

    return res.status(200).json(
        new ApiResponse(200, {
            signature,
            timestamp,
            cloudName: CLOUDINARY_CLOUD_NAME,
            apiKey: CLOUDINARY_API_KEY,
            folder: folder
        }, "Upload signature generated successfully")
    );
});

export {
    generateUploadSignature
};
