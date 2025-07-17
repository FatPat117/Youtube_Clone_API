const mongoose = require("mongoose");
const appConfig = require("./appConfig");

const connectDB = async () => {
        try {
                const connection = await mongoose.connect(appConfig.mongoURI);
                console.log(`Connected to MongoDB: ${connection.connection.host}`);
        } catch (error) {
                console.log(`Error connecting to MongoDB: ${error.message}`);
                process.exit(1);
        }
};

module.exports = connectDB;
