const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const paymentValidator = [
    body("bookingId").isMongoId().withMessage("Valid bookingId is required"),
    body("paymentMode").isIn(["Credit Card", "Debit Card", "UPI", "Net Banking"]).withMessage("Invalid payment mode"),
    validate
];

module.exports = {
    paymentValidator
};
