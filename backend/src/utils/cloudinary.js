import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // by default in node
import { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } from "../constants.js";

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // can also return error message

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "Project-00",
        });

        // console.log("File uploaded successfully on Cloudinary", response);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // console.log(error);

        fs.unlinkSync(localFilePath); // remove the  locally saved temporary file if there has been a issue uploading the file , as it can cause issues in the server

        return null;
    }
};

const deleteFromCloudinary = async (publicId, type) => {
    try {
        if (!publicId) return "public id not found to delete the file from cloudinary";

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: type,
            invalidate: true,
        });
        return response;
    } catch (error) {
        return error;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
