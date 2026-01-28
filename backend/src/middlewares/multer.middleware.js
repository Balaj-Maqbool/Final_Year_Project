import multer from "multer";
import fs from "fs";
import path from "path";

const tempDir = "./public/temp";

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
    console.log(`Creating temp directory at: ${tempDir}`);
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
        // Extract original extension (e.g. .jpg) or default to .png if missing
        const ext = path.extname(file.originalname) || ".png";
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    },
});

export const upload = multer({ storage });
