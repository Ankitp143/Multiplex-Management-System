const asyncHandler = require("../middleware/asyncHandler");
const paymentService = require("../services/paymentService");
const apiResponse = require("../utils/apiResponse");

const processPayment = asyncHandler(async (req, res) => {
    const result = await paymentService.processPayment(req.body, req.user.id);
    return apiResponse.success(res, "Payment processed and booking confirmed! 🎉", result, 200);
});

const getPaymentByBooking = asyncHandler(async (req, res) => {
    const payment = await paymentService.getPaymentByBooking(req.params.bookingId);
    return apiResponse.success(res, "Payment record retrieved", payment);
});

module.exports = {
    processPayment,
    getPaymentByBooking
};
