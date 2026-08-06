const apiResponse = require("../utils/apiResponse");

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return apiResponse.unauthorized(
                res,
                "Authentication required."
            );
        }

        if (!roles.includes(req.user.role)) {
            return apiResponse.error(
                res,
                "You are not authorized to perform this action.",
                403
            );
        }

        next();
    };
};

module.exports = authorize;