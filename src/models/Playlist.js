const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema(
        {
                name: {
                        type: String,
                        required: [true, "playlist name is required"],
                        trim: true,
                },
                description: {
                        type: String,
                        trim: true,
                },
                videos: [
                        {
                                type: mongoose.Schema.Types.ObjectId,
                                ref: "Video",
                        },
                ],
                owner: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                },
                isPublic: {
                        type: Boolean,
                        default: true,
                },
        },
        { timestamps: true }
);

// model
const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
