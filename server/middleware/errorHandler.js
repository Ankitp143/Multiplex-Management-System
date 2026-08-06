const apiResponse = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
    console.error("❌ Error:", err);

    return apiResponse.error(
        res,
        err.message || "Internal Server Error",
        err.statusCode || 500
    );
};

module.exports = errorHandler;