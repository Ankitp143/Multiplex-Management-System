const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const movieValidator = [
    body("title").trim().notEmpty().withMessage("Movie title is required"),
    body("description").trim().notEmpty().withMessage("Description is required"),
    body("genre").trim().notEmpty().withMessage("Genre is required"),
    body("language").trim().notEmpty().withMessage("Language is required"),
    body("duration").isNumeric().withMessage("Duration must be a number in minutes"),
    body("releaseDate").isISO8601().withMessage("Valid release date is required"),
    body("certificate").isIn(["U", "UA", "A", "R"]).withMessage("Certificate must be U, UA, A, or R"),
    validate
];

module.exports = {
    movieValidator
};