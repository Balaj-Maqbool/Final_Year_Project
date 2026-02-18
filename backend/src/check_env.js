import "dotenv/config";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, CORS_ORIGIN } from "./constants.js";

console.log("--- DEBUG ENV VARS ---");
console.log("ACCESS_TOKEN_EXPIRY:", ACCESS_TOKEN_EXPIRY);
console.log("REFRESH_TOKEN_EXPIRY:", REFRESH_TOKEN_EXPIRY);
console.log("CORS_ORIGIN:", CORS_ORIGIN);
console.log("----------------------");
