const express = require("express");
const playlistController = require("../controllers/playlistController");
const verifyJWT = require("../middlewares/authentication");

const router = express.Router();

//  Public
// Private
router.use(verifyJWT);
router.get("/user/:userId/playlists", playlistController.getUserPlaylists);
router.post("/", playlistController.createPlaylist);

//Add Video to Playlist
router.post("/:playlistId/videos/:videoId", playlistController.addVideoToPlaylist);

// Remove Video from Playlist
router.delete("/:playlistId/videos/:videoId", playlistController.removeVideoFromPlaylist);

// Get a playlist by id
router.get("/:playlistId", playlistController.getPlaylistById);

// Update a playlist
router.patch("/:playlistId", playlistController.updatePlaylist);

// Delete a playlist
router.delete("/:playlistId", playlistController.deletePlaylist);

module.exports = router;
