const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
        {
                likedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "user is required"],
                },
                video: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Video",
                },
                comment: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Comment",
                },
        },
        { timestamps: true }
);

// Ensure that a 'like' must refer to either a video or a comment, but not both
likeSchema.index({ likedBy: 1, video: 1 }, { unique: true, sparse: true });
likeSchema.index({ likedBy: 1, comment: 1 }, { unique: true, sparse: true });

likeSchema.pre("save", function (next) {
        if (!this.video && !this.comment) {
                return next(new Error("A like must refer to either a video or a comment"));
        }

        if (this.video && this.comment) {
                return next(new Error("A like cannot refer to both a video and a comment"));
        }

        next();
});

// Model
const Like = mongoose.model("Like", likeSchema);

module.exports = Like;
