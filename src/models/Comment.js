const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const commentSchema = new mongoose.Schema(
        {
                content: {
                        type: String,
                        required: [true, "comment content is required"],
                        trim: true,
                },
                video: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Video",
                        required: [true, "video is required"],
                },
                owner: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "owner is required"],
                },
                parentComment: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Comment",
                },
        },
        { timestamps: true }
);

// Add the mongoose aggregate-paginate plugin
commentSchema.plugin(mongooseAggregatePaginate);

// Add the text index for the content field
commentSchema.index({ content: "text" });

// Model
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
