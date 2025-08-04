const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const Comment = require("../models/Comment");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @Desc: Get all comments for a video with pagination and replies
// @route: GET /api/v1/comments/video/:videoId
// @access: Private
exports.getCommentsForVideo = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        if (!videoId) {
                throw new ApiError(400, "Video ID is required");
        }
});

// @Desc: Create a new comment or reply to a video
// @route: POST /api/v1/comments/video/:videoId
// @access: Private
exports.createComment = asyncHandler(async (req, res, next) => {
        const { videoId, content, parentCommentId } = req.body;
        const userId = req.user._id;
        if (!videoId || !content) {
                throw new ApiError(400, "Video ID and content are required");
        }
});

// @Desc : Update an existing comment
// @route: PATCH /api/v1/comments/video/:videoId
// @access: Private
exports.updateComment = asyncHandler(async (req, res, next) => {
        const { videoId, commentId } = req.params;
        const { content } = req.body;
        if (!videoId || !commentId || !content) {
                throw new ApiError(400, "Video ID, comment ID and content are required");
        }
});

// @Desc: Delete a comment and all its replies
// @route: DELETE /api/v1/comments/video/:videoId
// @access: Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
        const { videoId, commentId } = req.params;
        if (!videoId || !commentId) {
                throw new ApiError(400, "Video ID and comment ID are required");
        }
});

// @Desc: Get all replies for a comment with pagination
// @route: GET /api/v1/comments/video/:videoId/comment/:commentId/replies
// @access: Private
exports.getRepliesForComment = asyncHandler(async (req, res, next) => {
        const { videoId, commentId } = req.params;
        if (!videoId || !commentId) {
                throw new ApiError(400, "Video ID and comment ID are required");
        }
});
