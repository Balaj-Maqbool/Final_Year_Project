import { deleteFromCloudinary } from "../config/cloudinary.js";

/**
 * CloudinaryHelper provides utility functions for managing Cloudinary assets.
 * Primarily handles the logic of extracting identifiers from complex URLs.
 */
class CloudinaryHelper {
    /**
     * Extracts the public ID from a Cloudinary URL, including the folder name.
     * Example: https://res.cloudinary.com/.../v12345/folder/image.jpg -> folder/image
     * 
     * @param {string} url - The full Cloudinary URL.
     * @returns {string|null} - The public ID or null if extraction fails.
     */
    static getPublicIdFromUrl(url) {
        if (!url || typeof url !== "string") return null;

        try {
            // Split by '/' and get the last two parts (folder and filename)
            const parts = url.split("/");
            if (parts.length < 2) return null;

            const filenameWithExt = parts[parts.length - 1]; // e.g., image.jpg
            const folder = parts[parts.length - 2];         // e.g., folder

            // Remove extension from filename
            const publicIdWithoutFolder = filenameWithExt.split(".")[0];

            return `${folder}/${publicIdWithoutFolder}`;
        } catch (error) {
            console.error("Error extracting Public ID from Cloudinary URL:", error);
            return null;
        }
    }

    /**
     * Helper to safely delete an asset if a URL exists.
     */
    static async safeDelete(url) {
        const publicId = this.getPublicIdFromUrl(url);
        if (publicId) {
            try {
                return await deleteFromCloudinary(publicId);
            } catch (error) {
                console.error("Cloudinary safeDelete failed:", error);
                return null;
            }
        }
        return null;
    }
}

export { CloudinaryHelper };
