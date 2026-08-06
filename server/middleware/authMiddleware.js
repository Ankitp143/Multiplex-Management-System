const jwt = require("jsonwebtoken");
const apiResponse = require("../utils/apiResponse");

const authMiddleware = (req, res, next) => {
    try {
        // Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return apiResponse.unauthorized(
                res,
                "Access denied. No token provided."
            );
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Store user data in request
        req.user = decoded;

        next();
    } catch (error) {
        return apiResponse.unauthorized(
            res,
            "Invalid or expired token."
        );
    }
};

module.exports = authMiddleware;