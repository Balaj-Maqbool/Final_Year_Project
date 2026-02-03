import { RateLimiterMemory } from "rate-limiter-flexible";
import { ApiError } from "../utils/ApiError.js";

class RateLimitManager {
    /**
     * Creates a standard HTTP middleware using Token Bucket
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

    // --- HTTP MIDDLEWARE PRESETS ---

    /**
     * Global Limiter
     * 500 requests per 15 mins (900 seconds)
     */
    static global() {
        return this.create(500, 15 * 60, "Too many requests from this IP, please try again later");
    }

    /**
     * Auth Limiter (Strict)
     * 15 requests per hour (3600 seconds)
     */
    static auth() {
        return this.create(15, 60 * 60, "Too many login attempts, please try again after an hour");
    }

    /**
     * Media/Upload Limiter
     * 10 requests per hour
     */
    static media() {
        return this.create(10, 60 * 60, "Too many file uploads, please try again after an hour");
    }

    /**
     * Creates a raw limiter (NOT middleware) for use in Sockets/Logic
     * @param {number} points
     * @param {number} duration
     */
    static createWithoutMiddleware(points = 10, duration = 1) {
        return new RateLimiterMemory({
            points: points,
            duration: duration
        });
    }

    // --- SOCKET.IO HELPERS ---

    /**
     * Socket Message Limiter
     * 20 messages per minute
     */
    static socket() {
        return this.createWithoutMiddleware(20, 60);
    }
}

export { RateLimitManager };
