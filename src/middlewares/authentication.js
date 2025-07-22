const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");
const appConfig = require("../config/appConfig");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

// Middleware to authenticate user using JWT

const verifyJWT = asyncHandler(async (req, res, next) => {
        let token;
        try {
                if (req.cookies.accessToken) {
                        token = req.cookies.accessToken;
                } else if (req.headers.authorization) {
                        token = req.headers.authorization.split(" ")[1];
                }

                if (!token) {
                        return next(new ApiError(401, "Unauthorized request . Please login to continue"));
                }

                // Verify access token
                const decodedToken = jwt.verify(token, appConfig.accessTokenSecret);

                // Get user from database
                const user = await User.findById(decodedToken._id).select("-password -refreshToken");
                if (!user) {
                        return next(new ApiError(401, "Unauthorized request . Please login to continue"));
                }

                // Set user in request
                req.user = user;
                next();
        } catch (error) {
                // Special handling for logout
                if (req.path === "/logout") {
                        // Clear cookies
                        const cookieOptions = {
                                httpOnly: true,
                                sameSite: "strict",
                                secure: appConfig.nodeEnv === "production",
                                path: "/",
                                expires: new Date(0),
                        };
                        res.clearCookie("accessToken", cookieOptions);
                        res.clearCookie("refreshToken", cookieOptions);
                        return res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
                }
                return next(new ApiError(401, "Unauthorized request . Please login to continue"));
        }
});

module.exports = verifyJWT;
