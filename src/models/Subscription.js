const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
        {
                subscriber: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "user is required"],
                },
                channel: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "channel is required"],
                },
        },
        { timestamps: true }
);

// Compound index to ensure each user can only subscribe to a channel once
SubscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

// Model
const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
