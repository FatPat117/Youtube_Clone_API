const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Video = require("../models/Video");
const User = require("../models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");

// @Desc : Upload and publish a new video
// @route : POST /api/v1/videos
// @access : Private

exports.uploadVideo = asyncHandler(async (req, res, next) => {
        const { title, description, tags, category } = req.body;

        if (!title || !description || !tags || !category) {
                return next(new ApiError(400, "All fields are required"));
        }

        // Check if files are upload
        if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
                return next(new ApiError(400, "Video and thumbnail are required"));
        }

        const videoLocalPath = req.files.videoFile[0]?.path;
        const thumbnailLocalPath = req.files.thumbnail[0]?.path;

        if (!videoLocalPath || !thumbnailLocalPath) {
                return next(new ApiError(400, "Video or thumbnail not found"));
        }

        // Upload video to cloudinary
        const videoResult = await uploadToCloudinary(videoLocalPath, "youtube/videos");
        const thumbnailResult = await uploadToCloudinary(thumbnailLocalPath, "youtube/thumbnails");

        if (!videoResult || !thumbnailResult) {
                // Delete local files if upload fails
                await deleteFromCloudinary(videoResult?.public_id, "video");
                await deleteFromCloudinary(thumbnailResult?.public_id, "image");
                return next(new ApiError(500, "Failed to upload video or thumbnail"));
        }

        const user = await User.findById(req.user._id);

        // Create video document
        const video = await Video.create({
                title,
                description,
                tags: tags ? JSON.parse(tags) : [],
                category,
                videoFile: {
                        public_id: videoResult.public_id,
                        url: videoResult.secure_url,
                },
                thumbnail: {
                        public_id: thumbnailResult.public_id,
                        url: thumbnailResult.secure_url,
                },
                duration: videoResult.duration || 0,
                owner: user._id,
        });

        res.status(201).json(new ApiResponse(201, "Video uploaded successfully", video));
});
