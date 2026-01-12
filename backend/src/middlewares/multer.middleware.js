import multer from "multer";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // cb => callback function
        cb(null, "./public/temp");
    },
    filename: function (req, file, cb) {
        // cb(null, file.originalname) // not a good practice
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e5);
        cb(null, file.fieldname);
    },
});

// console.log("\n\n\n Multer Storage \n\n",storage)

export const upload = multer({ storage });
