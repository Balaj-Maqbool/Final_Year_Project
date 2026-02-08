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

    /**
     * Validates string length. Throws ApiError if invalid.
     * @param {string} value - The string to validate
     * @param {number} min - Minimum length (pass 0/null to skip)
     * @param {number} max - Maximum length (pass null to skip)
     * @param {string} fieldName - Name of the field for error message
     */
    static validateLength(value, min, max, fieldName = "Field") {
        const isActuallyEmpty = this.isEmpty(value);

        if (isActuallyEmpty && min > 0) {
            throw new ApiError(400, `${fieldName} is required`);
        }

        if (isActuallyEmpty) return;

        if (min && value.length < min) {
            throw new ApiError(400, `${fieldName} must be at least ${min} characters`);
        }
        if (max && value.length > max) {
            throw new ApiError(400, `${fieldName} must be less than ${max} characters`);
        }
    }

    /**
     * Validates a number range. Throws ApiError if invalid.
     */
    static validateRange(value, min, max, fieldName = "Field") {
        if (value === undefined || value === null) return;

        if (min !== null && value < min) {
            throw new ApiError(400, `${fieldName} must be at least ${min}`);
        }
        if (max !== null && value > max) {
            throw new ApiError(400, `${fieldName} must be at most ${max}`);
        }
    }

    /**
     * Validates email format.
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }
    }

    /**
     * Validates password strength step-by-step using simple regexes.
     */
    static validatePasswordStrength(password) {
        if (!/[A-Z]/.test(password)) {
            throw new ApiError(400, "Password must contain at least one uppercase letter (A-Z)");
        }
        if (!/[a-z]/.test(password)) {
            throw new ApiError(400, "Password must contain at least one lowercase letter (a-z)");
        }
        if (!/\d/.test(password)) {
            throw new ApiError(400, "Password must contain at least one number (0-9)");
        }
        if (!/[@$!%*?&#]/.test(password)) {
            throw new ApiError(400, "Password must contain at least one special character (@$!%*?&#)");
        }
    }
}

export { ValidationHelper };
