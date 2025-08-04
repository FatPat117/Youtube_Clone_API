const express = require("express");
const verifyJWT = require("../middlewares/authentication");
const upload = require("../middlewares/multer");
const router = express.Router();
const videoController = require("../controllers/videoController");
// Public routes
router.get("/", videoController.getAllVideos);
router.get("/share/:videoId", videoController.generateShareLink);
// Protected routes
router.use(verifyJWT);
router.get("/:videoId", videoController.getVideo);
router.patch("/:videoId", upload.single("thumbnail"), videoController.updateVideo);
router.delete("/:videoId", videoController.deleteVideo);
router.post("/", upload.fields([{ name: "videoFile" }, { name: "thumbnail" }]), videoController.uploadVideo);
router.patch("/toggle-publish/:videoId", videoController.togglePublishStatus);

module.exports = router;
