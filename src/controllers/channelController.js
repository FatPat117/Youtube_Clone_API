const mongoose = require("mongoose");

const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const asyncHandler = require("../utils/asyncHandler");
const Channel = require("../models/ChannelAnalytics");
const User = require("../models/User");

// @Desc : Get channel profile information
// @route : GET api/v1/channels/:username
// @access : Public

exports.getChannelInfo = asyncHandler(async (req, res, next) => {
        const { username } = req.params;
        if (!username) {
                return next(new ApiError(400, "Username is required"));
        }

        // Get the channel by username
        const channel = await User.findOne({ userName: username }).select(
                "-password -refreshToken -watchHistory -isVerified -notificationSettings -email"
        );
        if (!channel) {
                return next(new ApiError(404, "Channel not found"));
        }

        res.status(200).json(new ApiResponse(200, channel, "Channel information fetched successfully"));
});

// @ Desc: Update channel profile information and cover image
// @ route: PUT api/v1/channels/:username
// @ access: Private

exports.updateChannelInfo = asyncHandler(async (req, res, next) => {
        const { username } = req.params;
        const { channelDescription, channelTags, socialLinks } = req.body;
        const updatedData = {};

        if (channelDescription) updatedData.channelDescription = channelDescription;
        if (channelTags) updatedData.channelTags = Array.isArray(channelTags) ? channelTags : Array.from(channelTags);
        if (socialLinks)
                updatedData.socialLinks = typeof socialLinks === "object" ? socialLinks : JSON.parse(socialLinks);

        // Update cover image if provided

        if (req.files && req.files.coverImage && req.files.coverImage[0].path) {
                const coverImagePath = req.files.coverImage[0].path;

                // Delete old cover image if exists
                const user = await User.findById(req?.user?._id);
                if (user?.coverImage?.public_id) {
                        await deleteFromCloudinary(user?.coverImage?.public_id);
                }

                const coverImageUploadResult = await uploadToCloudinary(coverImagePath, "youtube/cover-images");
                if (!coverImageUploadResult) {
                        return next(new ApiError(500, "Failed to upload cover image"));
                }
                updatedData.coverImage = {
                        public_id: coverImageUploadResult.public_id,
                        url: coverImageUploadResult.secure_url,
                };
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(req?.user?._id, updatedData, { new: true }).select(
                "-password -refreshToken"
        );
        res.status(200).json(new ApiResponse(200, updatedUser, "Channel information updated successfully"));
});

// @Desc Update channel notification settings
// @route PUT api/v1/channels/notifications
// @access Private

exports.updateNotificationSettings = asyncHandler(async (req, res, next) => {
        const { emailNotifications, subscriptionActivity, commentActivity } = req.body;

        const notificationSettings = {};

        if (emailNotifications !== "undefined")
                notificationSettings["notificationSettings.emailNotifications"] = emailNotifications;

        if (subscriptionActivity !== "undefined")
                notificationSettings["notificationSettings.subscriptionActivity"] = subscriptionActivity;

        if (commentActivity !== "undefined")
                notificationSettings["notificationSettings.commentActivity"] = commentActivity;

        if (Object.keys(notificationSettings).length === 0) {
                return next(new ApiError(400, "No valid notification settings provided"));
        }

        const updatedUser = await User.findByIdAndUpdate(
                req?.user?._id,
                { $set: notificationSettings },
                { new: true }
        ).select("notificationSettings");

        if (!updatedUser) {
                return next(new ApiError(404, "User not found"));
        }

        res.status(200).json(new ApiResponse(200, updatedUser, "Notification settings updated successfully"));
});
