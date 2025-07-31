const express = require("express");
const verifyJWT = require("../middlewares/authentication");
const notificationController = require("../controllers/notificationController");
const router = express.Router();

// Public routes

// Protected routes
router.use(verifyJWT);
router.get("/", notificationController.getUserNotifications);
router.patch("/all-read", notificationController.markAllNotificationsAsRead);
router.patch("/:notificationId", notificationController.markNotificationAsRead);

router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
