const {
    registerUser,
    loginUser,
} = require("../services/authService");

const {
    successResponse,
    errorResponse,
} = require("../utils/apiResponse");

/**
 * Register Controller
 */
const register = async (req, res) => {
    try {
        const user = await registerUser(req.body);

        return successResponse(
            res,
            201,
            "User registered successfully",
            user
        );
    } catch (error) {
        return errorResponse(
            res,
            400,
            error.message
        );
    }
};

/**
 * Login Controller
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await loginUser(email, password);

        return successResponse(
            res,
            200,
            "Login successful",
            result
        );
    } catch (error) {
        return errorResponse(
            res,
            401,
            error.message
        );
    }
};

module.exports = {
    register,
    login,
};