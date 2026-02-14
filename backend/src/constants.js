import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../.env");

dotenv.config({ path: envPath });

const DB_NAME = "FreelanceMarketplace";
const DataBase_URI = process.env.DataBase_URI;

const PORT = process.env.PORT || 8000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "";
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1hr";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "3d";

const CLOUDINARY_CLOUD_NAME =
    process.env.CLOUDINARY_CLOUD_NAME || "cloud name Not Found";
const CLOUDINARY_API_KEY =
    process.env.CLOUDINARY_API_KEY || "cloud api key Not Found";
const CLOUDINARY_API_SECRET =
    process.env.CLOUDINARY_API_SECRET || "cloud api secret Not Found";
const CLOUDINARY_ROOT_FOLDER =
    process.env.CLOUDINARY_ROOT_FOLDER || "FreelanceMarketplace";

const GOOGLE_CLIENT_ID =
    process.env.GOOGLE_CLIENT_ID || "google client id Not Found";
const GOOGLE_CLIENT_SECRET =
    process.env.GOOGLE_CLIENT_SECRET || "google client secret Not Found";
const GOOGLE_REDIRECT_URI =
    process.env.GOOGLE_REDIRECT_URI || "google redirect uri Not Found";

const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME;

const FRONTEND_URL = process.env.FRONTEND_URL;
const FRONTEND_LOGIN_PATH = process.env.FRONTEND_LOGIN_PATH || "/login";
const FRONTEND_OAUTH_SUCCESS_PATH =
    process.env.FRONTEND_OAUTH_SUCCESS_PATH || "/oauth-success";
const FRONTEND_RESET_PASSWORD_PATH =
    process.env.FRONTEND_RESET_PASSWORD_PATH || "/reset-password";
const FRONTEND_DASHBOARD_PATH =
    process.env.FRONTEND_DASHBOARD_PATH || "/dashboard";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
    GOOGLE_REDIRECT_URI,
    CLOUDINARY_ROOT_FOLDER,
    SMTP_EMAIL,
    SMTP_PASSWORD,
    SMTP_FROM_NAME,
    FRONTEND_URL,
    FRONTEND_LOGIN_PATH,
    FRONTEND_OAUTH_SUCCESS_PATH,
    FRONTEND_RESET_PASSWORD_PATH,
    FRONTEND_DASHBOARD_PATH,
    GEMINI_API_KEY
};
