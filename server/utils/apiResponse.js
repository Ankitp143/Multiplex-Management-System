/**
 * Success Response
 */
const successResponse = (
    res,
    statusCode = 200,
    message = "Success",
    data = null
) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

/**
 * Error Response
 */
const errorResponse = (
    res,
    statusCode = 500,
    message = "Something went wrong"
) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = {
    successResponse,
    errorResponse,
};