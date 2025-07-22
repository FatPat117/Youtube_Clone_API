const express = require("express");
const channelController = require("../controllers/channelController");
const verifyJWT = require("../middlewares/authentication");
const upload = require("../middlewares/multer");
const router = express.Router();

// Public routes
router.get("/:username", channelController.getChannelInfo);

// Protected Routes
router.use(verifyJWT);

// Channel Customization Routes
router.patch("/:username", upload.fields([{ name: "coverImage", maxCount: 1 }]), channelController.updateChannelInfo);

module.exports = router;
