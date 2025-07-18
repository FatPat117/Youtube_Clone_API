const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/apiError");

// Configure store
const storage = multer.diskStorage({
        destination: function (req, file, cb) {
                cb(null, path.join(__dirname, "../uploads")); // where to save the file before uploading to cloudinary
        },
        filename: function (req, file, cb) {
                const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
                cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // file name
        },
});

// file filetr
const fileFilter = (req, file, cb) => {
        // Only accept images and videos
        if (file.mimetype.startsWith("image") || file.mimetype.startsWith("video")) {
                cb(null, true);
        } else {
                cb(new ApiError(400, "Only images and videos are allowed"), false);
        }
};

// Multer instance
const upload = multer({
        storage,
        fileFilter,
        limits: {
                fileSize: 1024 * 1024 * 5, // 5MB
        },
});
module.exports = upload;
