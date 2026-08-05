const { errorResponse } = require("../utils/apiResponse");

const errorHandler = (err, req, res, next) => {
    console.error(err);

    return errorResponse(
        res,
        err.statusCode || 500,
        err.message || "Internal Server Error"
    );
};

module.exports = errorHandler;