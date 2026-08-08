const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const theatreValidator = [
    body("name").trim().notEmpty().withMessage("Theatre name is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("phone").trim().notEmpty().withMessage("Phone number is required"),
    validate
];

module.exports = {
    theatreValidator
};
