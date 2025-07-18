const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
        {
                recipient: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "recipient is required"],
                },
                sender: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "sender is required"],
                },
                type: {
                        type: String,
                        required: [true, "notification type is required"],
                        enum: ["SUBSCRIPTION", "COMMENT", "REPLY", "SHARE", "VIDEO"],
                },
                content: {
                        type: String,
                        required: [true, "notification content is required"],
                },
                isRead: {
                        type: Boolean,
                        default: false,
                },
        },
        { timestamps: true }
);

// Model
const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
