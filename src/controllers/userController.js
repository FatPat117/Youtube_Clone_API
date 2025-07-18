const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadToCloudinary } = require("../utils/cloudinary");
const User = require("../models/User");

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

        // send response
        res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});
