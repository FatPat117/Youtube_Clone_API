const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const Video = require("../models/Video");
const User = require("../models/User");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");

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

        res.status(201).json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// @Desc : Get all videos
// @route : GET /api/v1/videos?page=1&limit=10&query=tutorial&sortBy=views&sortOrder=desc&userId=1234
// @access : Public

exports.getAllVideos = asyncHandler(async (req, res, next) => {
        const { page = 1, limit = 10, query, sortBy, sortOrder, userId } = req.query;

        // Initialize pipeline array for aggregation
        let pipeline = [];

        // Filter by User ID (if provided)
        if (userId) {
                pipeline.push({ $match: { owner: new mongoose.Types.ObjectId(userId) } });
        }

        //Text search (If provided)
        if (query) {
                pipeline.push({
                        $match: {
                                $or: [
                                        { title: { $regex: query, $options: "i" } },
                                        { description: { $regex: query, $options: "i" } },
                                        { tags: { $in: [new RegExp(query, "i")] } },
                                ],
                        },
                });
        }

        // Published Video Filter
        pipeline.push({ $match: { isPublished: true } });

        // User Data Lookup
        pipeline.push(
                {
                        $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_ id",
                                as: "owner",
                                pipeline: [
                                        {
                                                $project: {
                                                        userName: 1,
                                                        email: 1,
                                                        avatar: 1,
                                                },
                                        },
                                ],
                        },
                },
                // Convert Owner Array to Object
                {
                        $addFields: {
                                owner: { $first: "$owner" },
                        },
                }
        );

        // Sorting
        if (sortBy) {
                pipeline.push({ $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } });
        } else {
                pipeline.push({ $sort: { createdAt: -1 } });
        }

        // Calculate total number of video for Pagination
        const totalResults = await Video.countDocuments(pipeline.length > 0 ? pipeline[0].$match : {});

        // Pagnitaion
        pipeline.push({ $skip: (Number(page) - 1) * Number(limit) }, { $limit: Number(limit) });

        // Execute Pipeline
        const videos = await Video.aggregate(pipeline);

        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalResults / Number(limit));

        res.status(200).json(
                new ApiResponse(
                        200,
                        {
                                videos,
                                totalResults,
                                page,
                                limit,
                                totalPages: Math.ceil(totalResults / Number(limit)),
                                hasNextPage: Number(page) < totalPages,
                                hasPreviousPage: Number(page) > 1,
                        },
                        "Videos fetched successfully"
                )
        );
});
