import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve to backend/public/temp
// Structure: backend/src/middlewares/multer.middleware.js
// So ../../public/temp leads to backend/public/temp
const tempDir = path.join(__dirname, "../../public/temp");

// Ensure directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

export const upload = multer({ storage });
