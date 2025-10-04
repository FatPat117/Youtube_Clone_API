const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const Comment = require("../models/Comment");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Video = require("../models/Video");
const { createNotification } = require("./notificationController");

// @Desc: Get all comments for a video with pagination and replies
// @route: GET /api/v1/comments/video/:videoId
// @access: Private
exports.getCommentsForVideo = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!videoId) {
                throw new ApiError(400, "Video ID is required");
        }

        const comments = await Comment.aggregate([
                {
                        $match: {
                                video: new mongoose.Types.ObjectId(videoId),
                                parentComment: null,
                        },
                },
                {
                        $lookup: {
                                from: "user",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                        {
                                                $project: {
                                                        _id: 1,
                                                        userName: 1,
                                                        fullName: 1,
                                                        avatar: 1,
                                                },
                                        },
                                ],
                        },
                },
                {
                        $lookup: {
                                from: "comments",
                                localField: "_id",
                                foreignField: "parentComment",
                                as: "replies",
                                pipeline: [
                                        {
                                                $project: {
                                                        content: 1,
                                                },
                                                $lookup: {
                                                        from: "user",
                                                        localField: "owner",
                                                        foreignField: "_id",
                                                        as: "owner",
                                                        pipeline: [
                                                                {
                                                                        $project: {
                                                                                _id: 1,
                                                                                userName: 1,
                                                                                fullName: 1,
                                                                                avatar: 1,
                                                                        },
                                                                },
                                                        ],
                                                },
                                        },
                                ],
                        },
                },
                {
                        $addFields: {
                                owner: { $first: "$owner" },
                                replies: { $size: "$replies" },
                        },
                },
                {
                        $sort: {
                                createdAt: -1,
                        },
                },
                {
                        $skip: (parseInt(page) - 1) * parseInt(limit),
                },
                {
                        $limit: parseInt(limit),
                },
        ]);

        // Get total comments count
        const totalComments = await Comment.countDocuments({
                video: new mongoose.Types.ObjectId(videoId),
                parentComment: null,
        });

        return res.status(200).json(
                new ApiResponse(200, comments, "Comments fetched successfully", {
                        totalComments,
                        comments,
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalComments / parseInt(limit)),
                })
        );
});

// @Desc: Create a new comment or reply to a video
// @route: POST /api/v1/comments/videos/:videoId
// @access: Private
exports.createComment = asyncHandler(async (req, res, next) => {
        const { videoId } = req.params;
        const { content, parentCommentId } = req.body;

        if (!videoId) {
                throw new ApiError(400, "Video ID is required");
        }

        if (!content || content.trim() === "") {
                throw new ApiError(400, "Comment content is required");
        }

        // Validate video exists
        const video = await Video.findById(videoId);
        if (!video) {
                throw new ApiError(404, "Video not found");
        }

        let parentComment = null;

        if (parentCommentId) {
                if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
                        throw new ApiError(400, "Invalid parentCommentId");
                }

                parentComment = await Comment.findById(parentCommentId);
                if (!parentComment) {
                        throw new ApiError(404, "Parent comment not found");
                }
        }

        const comment = await Comment.create({
                content,
                video: video._id,
                owner: req.user._id,
                parentComment: parentComment ? parentComment._id : undefined,
        });

        const populatedComment = await Comment.findById(comment._id).populate("owner", "userName fullName avatar");

        // Send notifications
        if (parentComment && !parentComment.owner.equals(req.user._id)) {
                await createNotification(
                        parentComment.owner,
                        req.user._id,
                        "REPLY",
                        `${req.user.fullName} replied to your comment`
                );
        } else if (!video.owner.equals(req.user._id)) {
                await createNotification(
                        video.owner,
                        req.user._id,
                        "COMMENT",
                        `${req.user.fullName} commented on your video`
                );
        }

        return res.status(201).json(new ApiResponse(201, populatedComment, "Comment created successfully"));
});

// @Desc : Update an existing comment
// @route: PATCH /api/v1/comments/:commentId
// @access: Private
exports.updateComment = asyncHandler(async (req, res, next) => {
        const { commentId } = req.params;
        const { content } = req.body;
        if (!commentId) {
                throw new ApiError(400, "Comment ID is required");
        }

        if (!content || content.trim() === "") {
                throw new ApiError(400, "Comment content is required");
        }

        const comment = await Comment.findOne({
                _id: new mongoose.Types.ObjectId(commentId),
                owner: new mongoose.Types.ObjectId(req.user._id),
        });
        if (!comment) {
                throw new ApiError(404, "Comment not found");
        }

        comment.content = content;
        await comment.save();

        return res.status(200).json(new ApiResponse(200, comment, "Comment updated successfully"));
});

// @Desc: Delete a comment and all its replies
// @route: DELETE /api/v1/comments/:commentId
// @access: Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
        const { commentId } = req.params;
        if (!commentId) {
                throw new ApiError(400, "Comment ID is required");
        }

        // Delete comment and all replies
        await Promise.all([
                Comment.deleteMany({
                        parentComment: new mongoose.Types.ObjectId(commentId),
                }),
                Comment.findByIdAndDelete(new mongoose.Types.ObjectId(commentId)),
        ]);

        return res.status(200).json(new ApiResponse(200, null, "Comment deleted successfully"));
});

// @Desc: Get all replies for a comment with pagination
// @route: GET /api/v1/comments/:commentId/replies
// @access: Private
exports.getRepliesForComment = asyncHandler(async (req, res, next) => {
        const { commentId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        if (!commentId) {
                throw new ApiError(400, "Comment ID is required");
        }

        const replies = await Comment.aggregate([
                {
                        $match: {
                                parentComment: new mongoose.Types.ObjectId(commentId),
                        },
                },
                {
                        $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                        {
                                                $project: {
                                                        _id: 1,
                                                        userName: 1,
                                                        fullName: 1,
                                                        avatar: 1,
                                                },
                                        },
                                ],
                        },
                },
                {
                        $addFields: {
                                owner: { $first: "$owner" },
                        },
                },
                {
                        $sort: {
                                createdAt: -1,
                        },
                },
                {
                        $skip: (parseInt(page) - 1) * parseInt(limit),
                },
                {
                        $limit: parseInt(limit),
                },
        ]);

        // Get total replies count
        const totalReplies = await Comment.countDocuments({
                parentComment: new mongoose.Types.ObjectId(commentId),
        });

        return res.status(200).json(
                new ApiResponse(200, replies, "Replies fetched successfully", {
                        totalReplies,
                })
        );
});
