const mongoose = require("mongoose");

const channelAnalyticsSchema = new mongoose.Schema(
        {
                channel: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "channel is required"],
                },
                totalView: {
                        type: Number,
                        default: 0,
                },
                totalSubscribers: {
                        type: Number,
                        default: 0,
                },
                totalVideos: {
                        type: Number,
                        default: 0,
                },
                totalComments: {
                        type: Number,
                        default: 0,
                },
                dailyStats: [
                        {
                                date: {
                                        type: Date,
                                        required: [true, "date is required"],
                                },
                                views: {
                                        type: Number,
                                        default: 0,
                                },
                                subscribersGained: {
                                        type: Number,
                                        default: 0,
                                },
                                subscribersLost: {
                                        type: Number,
                                        default: 0,
                                },
                                likes: {
                                        type: Number,
                                        default: 0,
                                },
                                comments: {
                                        type: Number,
                                        default: 0,
                                },
                        },
                ],
        },
        { timestamps: true }
);

// index for faster lookups
channelAnalyticsSchema.index({ channel: 1 });

// model
const ChannelAnalytics = mongoose.model("ChannelAnalytics", channelAnalyticsSchema);

module.exports = ChannelAnalytics;
