const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Notification = require("../models/Notification");
const User = require("../models/User");
const mongoose = require("mongoose");

// Internal utility function to create a new notification
const createNotification = async (recipientId, senderId, type, content) => {
        try {
                //  Check if recipient has enabled notifications for this type
                const recipient = await User.findById(recipientId);

                if (!recipient) {
                        return null;
                }

                //    Check notifications settings
                if (
                        (type === "SUBSCRIPTION" && recipient.notificationSettings.subscriptionActivity === false) ||
                        (type === "COMMENT" && recipient.notificationSettings.commentActivity === false) ||
                        (type === "REPLY" && recipient.notificationSettings.commentActivity === false)
                ) {
                        // Notifications for this type are disabled
                        return null;
                }
                const sender = await User.findById(senderId);

                const notification = await Notification.create({
                        recipientId,
                        senderId,
                        type,
                        content,
                });
                return notification;
        } catch {
                return null;
        }
};

// @Desc : Get users notifications with pagination and filtering
// @route : GET /api/v1/notifications?page=1&limit=10&unreadOnly=false
// @access : Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
        const { page = 1, limit = 10, unreadOnly = false } = req.query;

        const matchStage = {
                recipient: new mongoose.Types.ObjectId(req.user._id),
        };

        if (unreadOnly) {
                matchStage.isRead = false;
        }

        const notifications = await Notification.aggregate([
                { $match: matchStage },
                {
                        //  Lookup sender user
                        $lookup: {
                                from: "users",
                                localField: "sender",
                                foreignField: "_id",
                                as: "sender",
                                pipeline: [
                                        {
                                                $project: {
                                                        fullName: 1,
                                                        userName: 1,
                                                        profileImage: 1,
                                                },
                                        },
                                ],
                        },
                },
                {
                        //  Add sender user to the notification
                        $addFields: {
                                sender: { $first: "$sender" },
                        },
                },
                {
                        $sort: { createdAt: -1 },
                },
                {
                        $skip: (Number(page) - 1) * Number(limit),
                },
        ]);

        const unreadCount = await Notification.countDocuments({
                recipient: new mongoose.Types.ObjectId(req.user._id),
                isRead: false,
        });

        const totalCount = await Notification.countDocuments({
                recipient: new mongoose.Types.ObjectId(req.user._id),
        });

        res.status(200).json(
                new ApiResponse(
                        200,
                        {
                                notifications,
                                unreadCount,
                                totalCount,
                                currentPage: Number(page),
                                totalPages: Math.ceil(totalCount / Number(limit)),
                        },
                        "Notifications fetched successfully"
                )
        );
});

// @Desc Mark a single notification as read
// @route : PATCH /api/v1/notifications/read/:notificationId
// @access : Private
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
        const { notificationId } = req.params;

        if (!notificationId) {
                throw new ApiError(400, "Notification ID is required");
        }
        if (!mongoose.Types.ObjectId.isValid(notificationId)) {
                throw new ApiError(400, "Invalid notification ID");
        }

        const notification = await Notification.findByIdAndUpdate(
                { _id: notificationId, recipient: req.user._id },
                { $set: { isRead: true } },
                { new: true }
        );

        if (!notification) {
                throw new ApiError(404, "Notification not found");
        }

        return res.status(200).json(new ApiResponse(200, notification, "Notification marked as read"));
});

// @Desc Mark all notifications as read
// @route : PATCH /api/v1/notifications/all-read
// @access : Private
exports.markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {
        await Notification.updateMany(
                { recipient: req.user._id, isRead: false },
                { $set: { isRead: true } },
                { new: true }
        );
        return res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});

// @Desc : Delete a notification
// @route : DELETE /api/v1/notifications/:notificationId
// @access : Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {});
