import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

/**
 * ValidationHelper centralizes common validation patterns used across the app.
 */
class ValidationHelper {
    /**
     * Checks if a string is a valid Mongoose ObjectId.
     */
    static isValidObjectId(id) {
        return mongoose.isValidObjectId(id);
    }

    /**
     * Validates an ObjectId and throws an ApiError if invalid.
     * Use this in controllers to fail fast.
     */
    static validateId(id, message = "Invalid ID format") {
        if (!this.isValidObjectId(id)) {
            throw new ApiError(400, message);
        }
        return true;
    }

    /**
     * Checks if a value is empty (null, undefined, empty string, or empty array).
     */
    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === "string" && value.trim() === "") return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    }
}

export { ValidationHelper };
