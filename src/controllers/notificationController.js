const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Notification = require("../models/Notification");

// @Desc : Get users notifications with pagination and filtering
// @route : GET /api/v1/notifications
// @access : Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {});

// @Desc Mark a single notification as read
// @route : PATCH /api/v1/notifications/read/:notificationId
// @access : Private
exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {});

// @Desc Mark all notifications as read
// @route : PATCH /api/v1/notifications/all-read
// @access : Private
exports.markAllNotificationsAsRead = asyncHandler(async (req, res, next) => {});

// @Desc : Delete a notification
// @route : DELETE /api/v1/notifications/:notificationId
// @access : Private
exports.deleteNotification = asyncHandler(async (req, res, next) => {});

// Internal utility function to create a new notification
const createNotification = asyncHandler(async (req, res, next) => {});
