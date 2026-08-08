const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const registerValidator = [
    body("firstName").trim().notEmpty().withMessage("First name is required"),
    body("lastName").trim().notEmpty().withMessage("Last name is required"),
    body("email").trim().isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    validate
];

const loginValidator = [
    body("email").trim().isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
    validate
];

const changePasswordValidator = [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters long"),
    validate
];

module.exports = {
    registerValidator,
    loginValidator,
    changePasswordValidator
};