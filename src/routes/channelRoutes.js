const express = require("express");
const channelController = require("../controllers/channelController");
const router = express.Router();

// Public routes
router.get("/:username", channelController.getChannelInfo);

module.exports = router;
