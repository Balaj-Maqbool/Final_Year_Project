import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Logic to load .env from the root 'backend' folder, assuming this file is in 'backend/src'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

const DB_NAME = "FreelanceMarketplace";
const DataBase_URI = process.env.DataBase_URI;

const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1hr";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "3d";

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "cloud name Not Found";
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "cloud api key Not Found";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "cloud api secret Not Found";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "google client id Not Found";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "google client secret Not Found";
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "google redirect uri Not Found";

export {
    DB_NAME,
    PORT,
    DataBase_URI,
    CORS_ORIGIN,
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
};
