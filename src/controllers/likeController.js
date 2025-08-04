const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Like = require("../models/Like");
const Video = require("../models/Video");
const User = require("../models/User");
const Comment = require("../models/Comment");
// @Desc: Toggle like/unlike on a video
// @route: POST /api/v1/likes/video/:videoId
// @access: Private
exports.toggleLikeVideo = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        const userId = req.user._id;

        if (!videoId) {
                throw new ApiError(400, "Video ID is required");
        }

        const video = await Video.findById(videoId);
        if (!video) {
                throw new ApiError(404, "Video not found");
        }

        // Check if already liked
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });
        if (existingLike) {
                // UnLike
                await Like.findByIdAndDelete(existingLike._id);
                return res.status(200).json(new ApiResponse(200, null, "Unlike video successfully"));
        }

        //   Like video
        const likeVideos = await Like.create({
                video: videoId,
                likedBy: userId,
        });
        return res.status(200).json(new ApiError(200, likeVideos, "Liked video successfully"));
});

// @Desc: Toggle like/unlike on a comment
// @route: POST /api/v1/likes/comment/:commentId
// @access: Private
exports.toggleLikeComment = asyncHandler(async (req, res, next) => {
        const { commentId } = req.params;
        const userId = req.user._id;
        if (!commentId) {
                throw new ApiError(400, "CommentId is required");
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
                throw new ApiError(404, "Comment not found");
        }

        const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });
        if (existingLike) {
                // Unlike comment
                await Like.findByIdAndDelete({ comment: commentId, likedBy: userId });
                return res.status(200).json(new ApiResponse(200, null, "Unlike comment successfully"));
        }

        // Like comment
        const likeComment = await Like.create({ comment: commentId, likedBy: userId });
        return res.status(200).json(new ApiResponse(200, likeComment, "Liked comment successfully"));
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
