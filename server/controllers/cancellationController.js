const asyncHandler = require("../middleware/asyncHandler");
const cancellationService = require("../services/cancellationService");
const apiResponse = require("../utils/apiResponse");

const requestCancellation = asyncHandler(async (req, res) => {
    const { bookingId, reason } = req.body;
    const cancellation = await cancellationService.requestCancellation(bookingId, reason, req.user.id);
    return apiResponse.success(res, "Cancellation processed successfully. Refund issued.", cancellation);
});

const getMyCancellations = asyncHandler(async (req, res) => {
    const cancellations = await cancellationService.getCancellationsByUser(req.user.id);
    return apiResponse.success(res, "Cancellations retrieved", cancellations);
});

const getAllCancellations = asyncHandler(async (req, res) => {
    const cancellations = await cancellationService.getAllCancellations();
    return apiResponse.success(res, "All cancellations retrieved", cancellations);
});

module.exports = {
    requestCancellation,
    getMyCancellations,
    getAllCancellations
};
