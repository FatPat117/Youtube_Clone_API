class ApiError extends Error {
        constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
                super(message);
                this.statusCode = statusCode;
                this.errors = errors;
                this.data = null; // if there was an error, data is null
                this.message = message;
                this.success = false;
                this.errors = errors;
                if (stack) {
                        this.stack = stack;
                } else {
                        Error.captureStackTrace(this, this.constructor);
                }
        }
}

module.exports = ApiError;
