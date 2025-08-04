const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Like = require("../models/Like");
const Video = require("../models/Video");
const User = require("../models/User");

// @Desc: Toggle like/unlike on a video
// @route: POST /api/v1/likes/video/:videoId
// @access: Private
exports.toggleLikeVideo = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        const { userId } = req.user;
});

// @Desc: Toggle like/unlike on a comment
// @route: POST /api/v1/likes/comment/:commentId
// @access: Private
exports.toggleLikeComment = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        const { userId } = req.user;
});

// @Desc: Get all liked  by the authenticated user
// @route: GET /api/v1/likes/videos
// @access: Private
exports.getLikedVideos = asyncHandler(async (req, res, next) => {
        const { userId } = req.user;
        const likes = await Like.find({ likedBy: userId });
        return res.status(200).json(new ApiResponse(200, likes, "Likes fetched successfully"));
});

// @Desc: Get all users who liked a specific video
// @route Get api/v1/videos/:videoId/likes
// @access: Private
exports.getVideoLikes = asyncHandler(async (req, res, next) => {});

// @Desc: Get all users who liked a specific comment
// @route Get api/v1/comments/:commentId/likes
// @access: Private
exports.getCommentLikes = asyncHandler(async (req, res, next) => {});
