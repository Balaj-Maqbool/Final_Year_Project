import { cloudinary } from "../config/cloudinary.config.js";
import fs from "fs";
import { CLOUDINARY_ROOT_FOLDER } from "../constants.js";
import { ValidationHelper } from "./validation.utils.js";

/**
 * CloudinaryHelper provides utility functions for managing Cloudinary assets.
 * Now handles both operational logic (upload/delete) and URL parsing.
 */
class CloudinaryHelper {
    /**
     * Uploads a file to Cloudinary and deletes the local temporary file.
     * @param {string} localFilePath - Path to the local file.
     * @returns {Promise<object|null>} - Cloudinary upload response or null.
     */
    static async upload(localFilePath, folder = CLOUDINARY_ROOT_FOLDER) {
        try {
            if (ValidationHelper.isEmpty(localFilePath)) return null;

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: folder
            });
            // console.log(response);

            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });
            return response;
        } catch (error) {
            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting temp file on upload failure:", err);
            });

            return null;
        }
    }

    /**
     * Deletes an asset from Cloudinary using its Public ID.
     * @param {string} publicId - The Public ID of the asset.
     * @param {string} type - Resource type (optional).
     * @returns {Promise<object|error>} - Cloudinary delete response or error.
     */
    static async delete(publicId, type) {
        try {
            if (ValidationHelper.isEmpty(publicId)) return "public id not found to delete the file from cloudinary";

            const response = await cloudinary.uploader.destroy(publicId, {
                resource_type: type,
                invalidate: true
            });
            return response;
        } catch (error) {
            return error;
        }
    }

    /**
     * Extracts the public ID from a Cloudinary URL, including the folder name.
     * Example: https://res.cloudinary.com/.../v12345/folder/image.jpg -> folder/image
     *
     * @param {string} url - The full Cloudinary URL.
     * @returns {string|null} - The public ID or null if extraction fails.
     */
    static getPublicIdFromUrl(url) {
        if (ValidationHelper.isEmpty(url)) return null;

        try {
            // Logic: Find the segment after version number (v12345) OR after 'upload/'
            // URL: https://res.cloudinary.com/cloudname/image/upload/v12345678/Folder/Subfolder/image.jpg

            const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
            const match = url.match(regex);

            if (match && match[1]) {
                return match[1]; // Returns "Folder/Subfolder/image"
            }

            return null;
        } catch (error) {
            console.error("Error extracting Public ID from Cloudinary URL:", error);
            return null;
        }
    }

    /**
     * Helper to safely delete an asset if a URL exists.
     * Extracts Public ID and then calls delete.
     */
    static async safeDelete(url) {
        const publicId = this.getPublicIdFromUrl(url);
        if (publicId) {
            try {
                return await this.delete(publicId);
            } catch (error) {
                console.error("Cloudinary safeDelete failed:", error);
                return null;
            }
        }
        return null;
    }
}

export { CloudinaryHelper };
