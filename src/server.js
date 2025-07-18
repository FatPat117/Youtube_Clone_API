const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRouter = require("./routes/userRoutes");
dotenv.config(); // Load env variables

//  Express Init
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json()); // Middleware to parse JSON bodies

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/v1/users", userRouter);

// Start the server
app.listen(PORT, () => {
        console.log(`Server is running on port... ${PORT}`);
});
