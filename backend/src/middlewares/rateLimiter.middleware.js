import { RateLimiterMemory } from "rate-limiter-flexible";
import { ApiError } from "../utils/ApiError.js";

class RateLimitManager {
    static create(points = 10, duration = 1, message = "Too many requests") {
        const rateLimiter = new RateLimiterMemory({
            points: points,
            duration: duration
        });

        return (req, res, next) => {
            rateLimiter
                .consume(req.ip)
                .then(() => {
                    next();
                })
                .catch(() => {
                    next(new ApiError(429, message));
                });
        };
    }

    static apiGlobal() {
        return this.create(
            500,
            15 * 60,
            "Too many requests from this IP, please try again later"
        );
    }

    static apiAuth() {
        return this.create(
            15,
            60 * 60,
            "Too many login attempts, please try again after an hour"
        );
    }

    static apiMedia() {
        return this.create(
            10,
            60 * 60,
            "Too many file uploads, please try again after an hour"
        );
    }

    static createGlobal(
        points = 10,
        duration = 1,
        message = "Service busy, please try again"
    ) {
        const rateLimiter = new RateLimiterMemory({
            points: points,
            duration: duration
        });

        return (req, res, next) => {
            rateLimiter
                .consume("GLOBAL_API_LIMIT")
                .then(() => {
                    next();
                })
                .catch(() => {
                    next(new ApiError(429, message));
                });
        };
    }

    static apiAI() {
        return this.createGlobal(
            10,
            60,
            "AI Service is currently at capacity (10 requests/min). Please try again shortly."
        );
    }

    static createWithoutMiddleware(points = 10, duration = 1) {
        return new RateLimiterMemory({
            points: points,
            duration: duration
        });
    }

    static socketMessage() {
        return this.createWithoutMiddleware(20, 60);
    }
}

export { RateLimitManager };
