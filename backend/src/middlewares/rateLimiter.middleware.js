import { RateLimiterMemory } from "rate-limiter-flexible";
import { ApiError } from "../utils/ApiError.js";

class RateLimitManager {
    /**
     * [INTERNAL] Creates a standard HTTP middleware using Token Bucket (Per IP)
     * @param {number} points - Max requests (Bucket Size)
     * @param {number} duration - Window in seconds (Refill Time)
     * @param {string} message - Error message
     */
    static create(points = 10, duration = 1, message = "Too many requests") {
        const rateLimiter = new RateLimiterMemory({
            points: points,
            duration: duration
        });

        return (req, res, next) => {
            rateLimiter
                .consume(req.ip) // Consume 1 point for the user's IP
                .then(() => {
                    next(); // Allowed
                })
                .catch(() => {
                    // Blocked
                    next(new ApiError(429, message));
                });
        };
    }

    /**
     * API Global Limiter
     * 500 requests per 15 mins (900 seconds)
     */
    static apiGlobal() {
        return this.create(500, 15 * 60, "Too many requests from this IP, please try again later");
    }

    /**
     * API Auth Limiter (Strict)
     * 15 requests per hour (3600 seconds)
     */
    static apiAuth() {
        return this.create(15, 60 * 60, "Too many login attempts, please try again after an hour");
    }

    /**
     * API Media/Upload Limiter
     * 10 requests per hour
     */
    static apiMedia() {
        return this.create(10, 60 * 60, "Too many file uploads, please try again after an hour");
    }

    /**
     * [INTERNAL] Creates a GLOBAL limiter shared by ALL users
     * @param {number} points - Max requests
     * @param {number} duration - Time window
     * @param {string} message - Error message
     */
    static createGlobal(points = 10, duration = 1, message = "Service busy, please try again") {
        const rateLimiter = new RateLimiterMemory({
            points: points,
            duration: duration
        });

        return (req, res, next) => {
            rateLimiter
                .consume("GLOBAL_API_LIMIT") // Consumes from the SAME bucket for everyone
                .then(() => {
                    next();
                })
                .catch(() => {
                    next(new ApiError(429, message));
                });
        };
    }

    /**
     * API AI Limiter
     * Gemini 2.5 Flash Free Tier: 10 RPM (Global Limit)
     */
    static apiAI() {
        return this.createGlobal(
            10,
            60,
            "AI Service is currently at capacity (10 requests/min). Please try again shortly."
        );
    }

    /**
     * [INTERNAL] Creates a raw limiter (NOT middleware) for use in Sockets/Logic
     * @param {number} points
     * @param {number} duration
     */
    static createWithoutMiddleware(points = 10, duration = 1) {
        return new RateLimiterMemory({
            points: points,
            duration: duration
        });
    }

    /**
     * Socket Message Limiter
     * 20 messages per minute
     */
    static socketMessage() {
        return this.createWithoutMiddleware(20, 60);
    }
}

export { RateLimitManager };
