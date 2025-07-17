const express = require("express");
const dotenv = require("dotenv");

dotenv.config(); // Load env variables

//  Express Init
const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
        console.log(`Server is running on port... ${PORT}`);
});
