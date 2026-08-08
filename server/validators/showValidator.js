const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const showValidator = [
    body("movieId").isMongoId().withMessage("Valid movieId is required"),
    body("theatreId").isMongoId().withMessage("Valid theatreId is required"),
    body("screenId").isMongoId().withMessage("Valid screenId is required"),
    body("showDate").isISO8601().withMessage("Valid show date is required"),
    body("startTime").notEmpty().withMessage("Start time is required (HH:MM format)"),
    body("endTime").notEmpty().withMessage("End time is required (HH:MM format)"),
    body("ticketPrice").isNumeric().withMessage("Ticket price must be a number"),
    validate
];

const lockSeatValidator = [
    body("seatNos").isArray({ min: 1 }).withMessage("seatNos array is required with at least one seat"),
    validate
];

module.exports = {
    showValidator,
    lockSeatValidator
};
