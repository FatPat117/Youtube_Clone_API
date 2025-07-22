const express = require("express");
const verifyJWT = require("../middlewares/authentication");
const upload = require("../middlewares/multer");
const router = express.Router();

// Public routes

// Protected routes
router.use(verifyJWT);

module.exports = router;
