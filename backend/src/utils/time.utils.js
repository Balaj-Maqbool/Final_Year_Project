/**
 * Parses a duration string into milliseconds.
 * Supports format: "1y", "1w", "1d", "10d", "1h", "20m", "30s"
 * @param {string} durationStr
 * @returns {number | undefined} milliseconds
 */
import { ValidationHelper } from "./validation.utils.js";

const parseDuration = (durationStr) => {
    if (ValidationHelper.isEmpty(durationStr)) return undefined;

    if (!isNaN(durationStr)) return parseInt(durationStr);

    const match = durationStr.match(/^(\d+)([dDhHmMsS]+)$/);
    if (!match) return undefined;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case "y":
            return value * 365 * 24 * 60 * 60 * 1000;
        case "w":
            return value * 7 * 24 * 60 * 60 * 1000;
        case "d":
            return value * 24 * 60 * 60 * 1000;
        case "h":
            return value * 60 * 60 * 1000;
        case "m":
            return value * 60 * 1000;
        case "s":
            return value * 1000;
        default:
            return undefined;
    }
};

export { parseDuration };
