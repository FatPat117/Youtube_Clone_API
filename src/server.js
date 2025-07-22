const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const { errorHandler, notFound } = require("./middlewares/error");
const userRouter = require("./routes/userRoutes");
const channelRouter = require("./routes/channelRoutes");
const videoRouter = require("./routes/videoRoutes");

dotenv.config(); // Load env variables

//  Express Init
const app = express();

// Connect to MongoDB
connectDB();

// Middlewares
app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser()); // Middleware to parse cookies

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/videos", videoRouter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
        console.log(`Server is running on port... ${PORT}`);
});
