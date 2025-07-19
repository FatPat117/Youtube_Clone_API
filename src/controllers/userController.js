const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const appConfig = require("../config/appConfig");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../models/User");

//Function to generate access token
const generateAccessAndRefreshToken = async (userId) => {
        try {
                const user = await User.findById(userId);
                if (!user) {
                        throw new ApiError(404, "User not found");
                }
                const accessToken = user.generateAccessToken();
                const refreshToken = user.generateRefreshToken();

                user.refreshToken = refreshToken;
                await user.save({ validateBeforeSave: false });

                return { accessToken, refreshToken };
        } catch (error) {
                throw new ApiError(500, "Failed to generate access and refresh token");
        }
};

// @ Desc: Register a new user with optional avatar and cover image
// @ route: POST api/v1/users/register
// @ access: Public

exports.registerUser = asyncHandler(async (req, res, next) => {
        const { userName, fullName, email, password } = req.body;

        if (!userName || !fullName || !email || !password) {
                return next(new ApiError(400, "All fields are required"));
        }

        // Check if user already exists
        const existingUser = await User.findOne({
                $or: [{ userName }, { email }],
        });
        if (existingUser) {
                return next(new ApiError(409, "User with this email or username already exists"));
        }

        // upload avatar
        let avatar;
        let avatarUploadResult;
        if (req.files && req.files.avatar && req.files.avatar[0]?.path) {
                avatar = req.files.avatar[0].path;
                avatarUploadResult = await uploadToCloudinary(avatar, "youtube/avatars");
        }
        if (!avatarUploadResult) {
                return next(new ApiError(400, "Failed to upload avatar"));
        }
        const avatarUpload = {
                public_id: avatarUploadResult.public_id,
                url: avatarUploadResult.secure_url,
        };

        // upload cover image
        let coverImage;
        let coverImageUploadResult;
        if (req.files && req.files.coverImage && req.files.coverImage[0]?.path) {
                coverImage = req.files.coverImage[0].path;
                coverImageUploadResult = await uploadToCloudinary(coverImage, "youtube/cover-images");
        }
        if (!coverImageUploadResult) {
                return next(new ApiError(400, "Failed to upload cover image"));
        }
        const coverImageUpload = {
                public_id: coverImageUploadResult.public_id,
                url: coverImageUploadResult.secure_url,
        };

        // create user
        const user = await User.create({
                userName: userName.toLowerCase(),
                fullName,
                email,
                password,
                avatar: Object.keys(avatarUpload).length > 0 ? avatarUpload : null,
                coverImage: Object.keys(coverImageUpload).length > 0 ? coverImageUpload : null,
        });

        // Remove password and refresh token from response
        const createdUser = await User.findById(user._id).select("-password -refreshToken");

        if (!createdUser) {
                return next(new ApiError(500, "Failed to create user"));
        }

        // Generate access token
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        const cookieOptions = {
                httpOnly: true,
                sameSite: "strict",
                secure: appConfig.nodeEnv === "production",
        };

        // send response
        res.status(201)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// @ Desc: Login a user
// @ route: POST api/v1/users/login
// @ access: Public

exports.loginUser = asyncHandler(async (req, res, next) => {
        const { email, password, userName } = req.body;

        if (!email || !password) {
                return next(new ApiError(400, "Email and password are required"));
        }

        // Check if user exists
        const user = await User.findOne({ $or: [{ email }, { userName }] });
        if (!user) {
                return next(new ApiError(401, "User not found"));
        }

        // Check if password is correct
        const isPasswordCorrect = await user.isPasswordCorrect(password);
        if (!isPasswordCorrect) {
                return next(new ApiError(401, "Invalid password"));
        }

        // Generate access token
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Get user with sensitive data
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        // Set cookies
        const cookieOptions = {
                httpOnly: true,
                sameSite: "strict", // Prevent CSRF attacks
                secure: appConfig.nodeEnv === "production",
        };

        // Send response
        res.status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(new ApiResponse(200, { loggedInUser }, "Login successful"));
});

// @ Desc: Logout a user
// @ route: POST api/v1/users/logout
// @ access: Public

exports.logoutUser = asyncHandler(async (req, res, next) => {
        // Clear refresh token from database
        const user = await User.findById(req.user._id);
        if (!user) {
                return next(new ApiError(404, "User not found"));
        }
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });

        // Clear cookies
        const cookieOptions = {
                httpOnly: true,
                sameSite: "strict",
                secure: appConfig.nodeEnv === "production",
        };
        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);
        res.status(200).json(new ApiResponse(200, {}, "User logged out successfully"));
});

// @ Desc: Refresh access token
// @ route: POST api/v1/users/refresh-token
// @ access: Public

exports.refreshAccessToken = asyncHandler(async (req, res, next) => {
        try {
                // Get refresh token from cookies or body
                const incomingRefreshToken = req?.cookies?.refreshToken || req.body.refreshToken;

                if (!incomingRefreshToken) {
                        throw new ApiError(401, "Refresh token is required");
                }
                //Verify the refresh token
                const decodedToken = jwt.verify(incomingRefreshToken, appConfig.refreshTokenSecret);

                //Find the user with ths refresh token
                const user = await User.findById(decodedToken._id);
                if (!user) {
                        throw new ApiError(401, "Invalid refresh token");
                }

                if (incomingRefreshToken !== user.refreshToken) {
                        throw new ApiError(401, "Refresh token is expired or used");
                }
                //Generate new tokens
                const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user?._id);
                //Set cookies
                const cookieOptions = {
                        httpOnly: true,
                        sameSite: "strict",
                        secure: appConfig.nodeEnv === "production",
                };

                return res
                        .status(200)
                        .cookie("accessToken", accessToken, cookieOptions)
                        .cookie("refreshToken", newRefreshToken, cookieOptions)
                        .json(
                                new ApiResponse(
                                        200,
                                        {
                                                accessToken,
                                                refreshToken: newRefreshToken,
                                        },
                                        "Access token refreshed successfully"
                                )
                        );
        } catch (error) {
                throw new ApiError(401, error?.message || "Invalid Refresh token");
        }
});

// @ Desc: Change user password
// @ route: POST api/v1/users/change-password
// @ access: Private

exports.changePassword = asyncHandler(async (req, res, next) => {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
                return next(new ApiError(400, "Old password and new password are required"));
        }

        const user = await User.findById(req.user._id);
        if (!user) {
                return next(new ApiError(404, "User not found"));
        }

        // Check if old password is correct
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if (!isPasswordCorrect) {
                return next(new ApiError(401, "Invalid old password"));
        }

        // Update password
        user.password = newPassword;
        user.refreshToken = null;
        await user.save({ validateBeforeSave: false });

        // Generate new tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Set cookies
        const cookieOptions = {
                httpOnly: true,
                sameSite: "strict",
                secure: appConfig.nodeEnv === "production",
        };

        // Send response
        res.status(200)
                .cookie("accessToken", accessToken, cookieOptions)
                .cookie("refreshToken", refreshToken, cookieOptions)
                .json(new ApiResponse(200, {}, "Password changed successfully"));
});
