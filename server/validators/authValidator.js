const { body, validationResult } = require("express-validator");

/**
 * Handle Validation Errors
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

/**
 * Registration Validation
 */
const registerValidator = [
    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required"),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long"),

    body("phone")
        .trim()
        .isMobilePhone()
        .withMessage("Please enter a valid phone number"),

    validate,
];

/**
 * Login Validation
 */
const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email"),

    body("password")
        .notEmpty()
        .withMessage("Password is required"),

    validate,
];

module.exports = {
    registerValidator,
    loginValidator,
};