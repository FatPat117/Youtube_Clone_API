const dotenv = require("dotenv");

dotenv.config();

const appConfig = {
        port: process.env.PORT || 8000,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "access-token-secret",
        nodeEnv: process.env.NODE_ENV || "development",
        mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/youtube-clone",
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY,
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY,
        cloudinary: {
                cloudName: process.env.CLOUDINARY_CLOUD_NAME,
                apiKey: process.env.CLOUDINARY_API_KEY,
                apiSecret: process.env.CLOUDINARY_API_SECRET,
        },
        corsOrigin: process.env.CORS_ORIGIN,
};

module.exports = appConfig;
