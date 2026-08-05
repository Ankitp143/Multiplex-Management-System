const express = require("express");

const router = express.Router();

const {
    register,
    login,
} = require("../controllers/authController");

const {
    registerValidator,
    loginValidator,
} = require("../validators/authValidator");

/**
 * Register User
 * POST /api/auth/register
 */
router.post(
    "/register",
    registerValidator,
    register
);

/**
 * Login User
 * POST /api/auth/login
 */
router.post(
    "/login",
    loginValidator,
    login
);

module.exports = router;