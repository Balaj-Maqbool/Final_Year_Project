import mongoose from "mongoose";
import { ApiError } from "./ApiError.js";

class ValidationHelper {
    static isValidObjectId(id) {
        return mongoose.isValidObjectId(id);
    }

    static validateId(id, message = "Invalid ID format") {
        if (!this.isValidObjectId(id)) {
            throw new ApiError(400, message);
        }
        return true;
    }

    static isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === "string" && value.trim() === "") return true;
        if (Array.isArray(value) && value.length === 0) return true;
        return false;
    }

    static validateLength(value, min, max, fieldName = "Field") {
        if (this.isEmpty(value)) {
            if (min > 0) {
                throw new ApiError(400, `${fieldName} is required`);
            }
            return;
        }

        if (min && value.length < min) {
            throw new ApiError(
                400,
                `${fieldName} must be at least ${min} characters`
            );
        }
        if (max && value.length > max) {
            throw new ApiError(
                400,
                `${fieldName} must be less than ${max} characters`
            );
        }
    }

    static validateRange(value, min, max, fieldName = "Field") {
        if (this.isEmpty(value)) {
            if (min !== null && min !== undefined) {
                throw new ApiError(400, `${fieldName} is required`);
            }
            return;
        }

        if (min !== null && min !== undefined && value < min) {
            throw new ApiError(400, `${fieldName} must be at least ${min}`);
        }
        if (max !== null && max !== undefined && value > max) {
            throw new ApiError(400, `${fieldName} must be at most ${max}`);
        }
    }

    static validateEmail(email) {
        if (this.isEmpty(email)) {
            throw new ApiError(400, "Email is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ApiError(400, "Invalid email format");
        }
    }

    static validatePasswordStrength(password) {
        if (!/[A-Z]/.test(password)) {
            throw new ApiError(
                400,
                "Password must contain at least one uppercase letter (A-Z)"
            );
        }
        if (!/[a-z]/.test(password)) {
            throw new ApiError(
                400,
                "Password must contain at least one lowercase letter (a-z)"
            );
        }
        if (!/\d/.test(password)) {
            throw new ApiError(
                400,
                "Password must contain at least one number (0-9)"
            );
        }
        if (!/[@$!%*?&#]/.test(password)) {
            throw new ApiError(
                400,
                "Password must contain at least one special character (@$!%*?&#)"
            );
        }
    }
}

export { ValidationHelper };
