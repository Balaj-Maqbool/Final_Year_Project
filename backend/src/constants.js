import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const DB_NAME = "MyProject";
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
};
