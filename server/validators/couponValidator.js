const { body } = require("express-validator");
const validate = require("../middleware/validationMiddleware");

const couponValidator = [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
    body("validUntil").isISO8601().withMessage("Valid expiry date is required"),
    validate
];

const applyCouponValidator = [
    body("code").trim().notEmpty().withMessage("Coupon code is required"),
    body("bookingAmount").isNumeric().withMessage("Booking amount is required"),
    validate
];

module.exports = {
    couponValidator,
    applyCouponValidator
};
