const express = require("express");
const userController = require("../controllers/userController");
const upload = require("../middlewares/multer");
const verifyJWT = require("../middlewares/authentication");
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
router.post("/refresh-token", userController.refreshAccessToken);
// Private routes
router.use(verifyJWT);
router.post("/logout", userController.logoutUser);
router.patch("/change-password", userController.changePassword);
router.get("/current-user", userController.getUserProfile);
module.exports = router;
