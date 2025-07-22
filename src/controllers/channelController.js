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
