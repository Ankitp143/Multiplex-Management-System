const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
    console.error("=================================");
    console.error("ERROR:", err.message);
    console.error("=================================");

    const statusCode = err.statusCode || 500;

    return errorResponse(
        res,
        statusCode,
        err.message || "Internal Server Error"
    );
};

module.exports = errorHandler;