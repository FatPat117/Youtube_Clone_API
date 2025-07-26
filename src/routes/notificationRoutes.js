const express = require("express");
const verifyJWT = require("../middlewares/verifyJWT");
const notificationController = require("../controllers/notificationController");
const router = express.Router();

// Public routes

// Protected routes
router.use(verifyJWT);
router.get("/", notificationController.getUserNotifications);

router.patch("/read/:notificationId", notificationController.markNotificationAsRead);

router.patch("/all-read", notificationController.markAllNotificationsAsRead);

router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
