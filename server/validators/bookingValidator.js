const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const bookingValidator = [
    body("showId").isMongoId().withMessage("Valid showId is required"),
    body("seats").isArray({ min: 1 }).withMessage("At least one seat must be selected"),
    body("seats.*.seatNo").notEmpty().withMessage("seatNo is required for each seat"),
    validate
];

module.exports = {
    bookingValidator
};
