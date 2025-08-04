const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const verifyJWT = require("../middlewares/verifyJWT");

router.get("/video/:videoId", commentController.getCommentsForVideo);
router.post("/video/:videoId", verifyJWT, commentController.createComment);
router.patch("/:commentId", verifyJWT, commentController.updateComment);
router.delete("/:commentId", verifyJWT, commentController.deleteComment);
router.get("/:commentId/replies", commentController.getRepliesForComment);

module.exports = router;
