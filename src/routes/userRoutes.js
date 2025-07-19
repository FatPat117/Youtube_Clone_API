const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../middlewares/multer");
const router = express.Router();

// Public routes
router.post(
        "/register",
        upload.fields([
                { name: "avatar", maxCount: 1 },
                { name: "coverImage", maxCount: 1 },
        ]),
        userController.registerUser
);
router.post("/login", userController.loginUser);

module.exports = router;
