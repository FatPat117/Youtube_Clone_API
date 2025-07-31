const asyncHandler = required("../utils/asyncHandler");
const Playlist = required("../models/Playlist.js");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// @Desc : Create a new playlist
// @route : POST /api/v1/playlists
// @access : Private
exports.createPlaylist = asyncHandler(async (req, res, next) => {
        const { title, description, isPublic } = req.body;
});

// @Desc : Add a video to a playlist
// @route : POST /api/v1/playlists/:playlistId/videos/:videoId
// @access : Private
exports.addVideoToPlaylist = asyncHandler(async (req, res, next) => {
        const { title, description, isPublic } = req.body;
});

// @Desc : Remove a video from a playlist
// @route : DELETE /api/v1/playlists/:playlistId/videos/:videoId
// @access : Private
exports.removeVideoFromPlaylist = asyncHandler(async (req, res, next) => {
        const { title, description, isPublic } = req.body;
});

// @Desc : Get user's playlists with videos info
// @route : GET /api/v1/users/:userId/playlist
// @Access: Public
exports.getUserPlaylists = asyncHandler(async (req, res, next) => {});

// @Desc : Get detailed information about a specific playlist
// @route : GET /api/v1/playlists/:playlistId
// @Access: Public
exports.getPlaylistById = asyncHandler(async (req, res, next) => {});

// @Desc : Update a playlist (name,description,privacy)
// @route : PATCH /api/v1/playlists/:playlistId
// @Access: Public
exports.updatePlaylist = asyncHandler(async (req, res, next) => {});

// @Desc : Delete a Playlist
// @route: DELETE /api/v1/playlist/:playlistId
// @Access : Private

exports.deletePlaylist = asyncHandler(async (req, res, next) => {});
