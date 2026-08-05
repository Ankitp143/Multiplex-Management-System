const {
    registerUser,
    loginUser,
} = require("../services/authService");

const { successResponse } = require("../utils/apiResponse");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Register User
 */
const register = asyncHandler(async (req, res) => {

    const user = await registerUser(req.body);

    return successResponse(
        res,
        201,
        "User registered successfully",
        user
    );
});

/**
 * Login User
 */
const login = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const result = await loginUser(email, password);

    return successResponse(
        res,
        200,
        "Login successful",
        result
    );
});

module.exports = {
    register,
    login,
};