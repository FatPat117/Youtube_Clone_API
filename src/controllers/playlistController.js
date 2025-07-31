const asyncHandler = require("../utils/asyncHandler");
const Playlist = require("../models/Playlist.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const mongoose = require("mongoose");
// @Desc : Create a new playlist
// @route : POST /api/v1/playlists
// @access : Private
exports.createPlaylist = asyncHandler(async (req, res, next) => {
        const { name, description, isPublic = true } = req.body;

        if (!name || !name.trim()) {
                throw new ApiError(400, "Name of Playlist is required");
        }

        // Create playlist
        const playlist = await Playlist.create({
                name,
                description: description || "",
                isPublic: Boolean(isPublic),
                owner: req.user._id,
        });

        return res.status(201).json(new ApiResponse(201, playlist, "Create a new playlist successfully"));
});

// @Desc : Add a video to a playlist
// @route : POST /api/v1/playlists/:playlistId/videos/:videoId
// @access : Private
exports.addVideoToPlaylist = asyncHandler(async (req, res, next) => {
        const { playlistId, videoId } = req.params;

        if (!playlistId || !videoId) {
                throw new ApiError(400, "Playlist ID and Video ID are required");
        }

        // Check if playlist exists and belong to current user
        const playlist = await Playlist.findOne({
                _id: playlistId,
                owner: req.user._id,
        });

        if (!playlist) {
                throw new ApiError(404, "Playlist not found or you don't have permission to access it");
        }

        // Check if video already in playlist
        const isVideoInPlaylist = playlist.videos.includes(videoId);

        if (isVideoInPlaylist) {
                throw new ApiError(400, "Video already in playlist");
        }

        // Add video to playlist
        const updatedPlaylist = await Playlist.findByIdAndUpdate(
                playlistId,
                { $push: { videos: videoId } },
                { new: true }
        );

        return res.status(200).json(new ApiResponse(200, playlist, "Video added to playlist successfully"));
});

// @Desc : Remove a video from a playlist
// @route : DELETE /api/v1/playlists/:playlistId/videos/:videoId
// @access : Private
exports.removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
        const { title, description, isPublic } = req.body;
});

// @Desc : Get user's playlists with videos info
// @route : GET /api/v1/users/:userId/playlists
// @Access: Public
exports.getUserPlaylists = asyncHandler(async (req, res, next) => {
        const { userId } = req.params;
        const userIdToUse = userId || req.user._id;

        if (!userIdToUse) {
                throw new ApiError(400, "userId is required");
        }

        const isOwner = req?.user._id.toString() === userIdToUse.toString();

        let playlistsObj;
        // if not the owner, only return public playlist
        if (!isOwner) {
                const playlists = await Playlist.find({ owner: userIdToUse, isPublic: true })
                        .sort({ createdAt: -1 })
                        .populate({
                                path: "videos",
                                select: "_id title thumbnail duration videoFile views createdAt",
                        });
                playlistsObj = {
                        playlists,
                        total: playlists.length,
                };
        } else {
                const playlists = await Playlist.find({ owner: userIdToUse }).sort({ createdAt: -1 }).populate({
                        path: "videos",
                        select: "_id title thumbnail duration videoFile views createdAt",
                });
                playlistsObj = {
                        playlists,
                        total: playlists.length,
                };
        }

        return res.status(200).json(new ApiResponse(200, { playlistsObj }, "Get user's playlists successfully"));
});

// @Desc : Get detailed information about a specific playlist
// @route : GET /api/v1/playlists/:playlistId
// @Access: Public
exports.getPlaylistById = asyncHandler(async (req, res, next) => {
        const { playlistId } = req.params;
        if (!playlistId) {
                throw new ApiError(400, "playlistId is required");
        }

        const playlist = await Playlist.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(playlistId) } },
                {
                        $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                        {
                                                $project: {
                                                        userName: 1,
                                                        fullName: 1,
                                                        avatar: 1,
                                                },
                                        },
                                ],
                        },
                },
                {
                        $lookup: {
                                from: "videos",
                                localField: "videos",
                                foreignField: "_id",
                                as: "video",
                                pipeline: [
                                        {
                                                $project: {
                                                        videoFile: 1,
                                                        title: 1,
                                                        thumbnail: 1,
                                                        duration: 1,
                                                        views: 1,
                                                },
                                        },
                                        {
                                                $lookup: {
                                                        from: "users",
                                                        localField: "owner",
                                                        foreignField: "_id",
                                                        as: "owner",
                                                        pipeline: [
                                                                {
                                                                        $project: {
                                                                                userName: 1,
                                                                                fullName: 1,
                                                                                avatar: 1,
                                                                        },
                                                                },
                                                                {
                                                                        $addFields: {
                                                                                owner: { $first: "$owner" },
                                                                        },
                                                                },
                                                        ],
                                                },
                                        },
                                ],
                        },
                },
                {
                        $addFields: {
                                owner: { $first: "$owner" },
                                videoCount: { $size: "$video" },
                        },
                },
        ]);
        if (!playlist.length) {
                throw new ApiError(404, "Playlist not found");
        }
        const playlistData = playlist[0];

        //  Check if the playlist is public or not
        if (!playlistData.isPublic) {
                if (!req.user || req.user._id.toString() !== playlistData.owner._id.toString()) {
                        throw new ApiError(403, "You are not authorized to access this playlist");
                }
        }

        return res.status(200).json(new ApiResponse(200, playlistData, "Get playlist successfully"));
});

// @Desc : Update a playlist (name,description,privacy)
// @route : PATCH /api/v1/playlists/:playlistId
// @Access: Public
exports.updatePlaylist = asyncHandler(async (req, res, next) => {});

// @Desc : Delete a Playlist
// @route: DELETE /api/v1/playlist/:playlistId
// @Access : Private

exports.deletePlaylist = asyncHandler(async (req, res, next) => {});
