const appConfig = require("../config/appConfig");
const ApiError = require("../utils/ApiError");

// Error handling middleware

const errorHandler = (err, req, res, next) => {
        let error = err;

        if (!(error instanceof ApiError)) {
                const statusCode = error.statusCode || error.status || 500;
                const message = error.message || "Something went wrong";
                error = new ApiError(statusCode, message, error?.errors || [], err.stack);
        }

        // Final response
        const response = {
                success: false,
                message: error.message,
                errors: error.errors,
                data: error.data,
                stack: appConfig.nodeEnv === "development" ? error.stack : null,
        };

        return res.status(error.statusCode).json(response);
};

// Not found middleware
const notFound = (req, res, next) => {
        const error = new ApiError(404, "Route not found");
        next(error);
};

module.exports = { errorHandler, notFound };
