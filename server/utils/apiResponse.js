const success = (res, message = "Success", data = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};

const error = (res, message = "Something went wrong", statusCode = 500) => {
    return res.status(statusCode).json({
        success: false,
        message,
    });
};

const validationError = (res, errors) => {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
    });
};

const unauthorized = (res, message = "Unauthorized") => {
    return res.status(401).json({
        success: false,
        message,
    });
};

const notFound = (res, message = "Resource not found") => {
    return res.status(404).json({
        success: false,
        message,
    });
};

module.exports = {
    success,
    error,
    validationError,
    unauthorized,
    notFound,
};