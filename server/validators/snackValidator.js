const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const snackValidator = [
    body("name").trim().notEmpty().withMessage("Snack name is required"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("category").isIn(["Popcorn", "Beverage", "Combos", "Snacks"]).withMessage("Invalid category"),
    validate
];

module.exports = {
    snackValidator
};
