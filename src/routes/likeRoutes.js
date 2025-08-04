const express = require("express");
const verifyJWT = require("../middlewares/authentication");
const likeController = require("../controllers/likeController");
const router = express.Router();

// @Desc: Toggle like/unlike on a video
// @route: POST /api/v1/likes/video/:videoId

// @access: Private
router.post("/video/:videoId", verifyJWT, likeController.toggleLikeVideo);

router.post("/comment/:commentId", verifyJWT, likeController.toggleLikeComment);

router.get("/videos", verifyJWT, likeController.getLikedVideos);
router.get("/videos/:videoId", verifyJWT, likeController.getVideoLikes);
router.get("/comments/:commentId", verifyJWT, likeController.getCommentLikes);

module.exports = router;
