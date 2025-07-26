const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const VideoSchema = new mongoose.Schema(
        {
                videoFile: {
                        public_id: {
                                type: String,
                                required: [true, "videoFile public_id is required"],
                        },
                        url: {
                                type: String,
                                required: [true, "videoFile url is required"],
                        },
                },
                thumbnail: {
                        public_id: {
                                type: String,
                                required: [true, "thumbnail public_id is required"],
                        },
                        url: {
                                type: String,
                                required: [true, "thumbnail url is required"],
                        },
                },
                title: {
                        type: String,
                        required: [true, "video title is required"],
                        trim: true,
                        index: true,
                },
                description: {
                        type: String,
                        required: [true, "video description is required"],
                        trim: true,
                        index: true,
                },
                duration: {
                        type: Number,
                        required: [true, "video duration is required"],
                },
                views: {
                        type: Number,
                        default: 0,
                },
                shares: {
                        type: Number,
                        default: 0,
                },
                isPublished: {
                        type: Boolean,
                },

                owner: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                        required: [true, "video owner is required"],
                },
                category: {
                        type: String,
                        required: [true, "video category is required"],
                },
                tags: [
                        {
                                type: String,
                                required: [true, "video tags are required"],
                        },
                ],
        },
        { timestamps: true }
);

// Add the mongoose aggregate-paginate plugin
VideoSchema.plugin(mongooseAggregatePaginate);

// Add index for text search
VideoSchema.index({ title: "text", description: "text", tags: "text" });

// Model
const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
