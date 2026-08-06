const { body } = require("express-validator");

const createMovieValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Movie title is required"),

    body("description")
        .trim()
        .notEmpty()
        .withMessage("Description is required"),

    body("genre")
        .trim()
        .notEmpty()
        .withMessage("Genre is required"),

    body("language")
        .trim()
        .notEmpty()
        .withMessage("Language is required"),

    body("duration")
        .isInt({ min: 1 })
        .withMessage("Duration must be greater than 0"),

    body("releaseDate")
        .isISO8601()
        .withMessage("Release date must be a valid date"),

    body("certificate")
        .isIn(["U", "UA", "A"])
        .withMessage("Certificate must be U, UA or A"),

    body("status")
        .optional()
        .isIn(["Coming Soon", "Now Showing"])
        .withMessage("Invalid movie status")
];

module.exports = {
    createMovieValidator
};