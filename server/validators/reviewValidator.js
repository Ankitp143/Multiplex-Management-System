const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const reviewValidator = [
    body("movieId").isMongoId().withMessage("Valid movieId is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").trim().notEmpty().withMessage("Comment is required"),
    validate
];

module.exports = {
    reviewValidator
};
