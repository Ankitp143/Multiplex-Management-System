const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const apiResponse = require("../utils/apiResponse");

const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationError(res, errors.array());
        }

        const user = await authService.registerUser(req.body);

        return apiResponse.success(
            res,
            "User registered successfully",
            user,
            201
        );

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationError(res, errors.array());
        }

        const { email, password } = req.body;

        const result = await authService.loginUser(email, password);

        return apiResponse.success(
            res,
            "Login successful",
            result
        );

    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login
};