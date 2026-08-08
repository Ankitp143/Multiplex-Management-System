const asyncHandler = require("../middleware/asyncHandler");
const bookingService = require("../services/bookingService");
const apiResponse = require("../utils/apiResponse");

const createBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.body, req.user.id);
    return apiResponse.success(res, "Booking created successfully", booking, 201);
});

const getUserBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user.id);
    return apiResponse.success(res, "User bookings retrieved successfully", bookings);
});

const getBooking = asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
    return apiResponse.success(res, "Booking retrieved successfully", booking);
});

const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await bookingService.getAllBookings();
    return apiResponse.success(res, "All bookings retrieved successfully", bookings);
});

module.exports = {
    createBooking,
    getUserBookings,
    getBooking,
    getAllBookings
};
