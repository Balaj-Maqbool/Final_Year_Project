import { cloudinary } from "../config/cloudinary.config.js";
import fs from "fs";
import { CLOUDINARY_ROOT_FOLDER } from "../constants.js";
import { ValidationHelper } from "./validation.utils.js";

class CloudinaryHelper {
    static async upload(localFilePath, folder = CLOUDINARY_ROOT_FOLDER) {
        try {
            if (ValidationHelper.isEmpty(localFilePath)) return null;

            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto",
                folder: folder
            });

            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });
            return response;
        } catch (error) {
            fs.unlink(localFilePath, (err) => {
                if (err)
                    console.error(
                        "Error deleting temp file on upload failure:",
                        err
                    );
            });

            return null;
        }
    }

    static async delete(publicId, type) {
        try {
            if (ValidationHelper.isEmpty(publicId))
                return "public id not found to delete the file from cloudinary";

            const response = await cloudinary.uploader.destroy(publicId, {
                resource_type: type,
                invalidate: true
            });
            return response;
        } catch (error) {
            return error;
        }
    }

    static getPublicIdFromUrl(url) {
        if (ValidationHelper.isEmpty(url)) return null;

        try {
            const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
            const match = url.match(regex);

            if (match && match[1]) {
                return match[1];
            }

            return null;
        } catch (error) {
            console.error(
                "Error extracting Public ID from Cloudinary URL:",
                error
            );
            return null;
        }
    }

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
