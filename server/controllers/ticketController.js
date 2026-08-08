const asyncHandler = require("../middleware/asyncHandler");
const ticketService = require("../services/ticketService");
const apiResponse = require("../utils/apiResponse");

const getTicket = asyncHandler(async (req, res) => {
    const ticket = await ticketService.getTicketByBooking(req.params.bookingId);
    return apiResponse.success(res, "Ticket retrieved successfully", ticket);
});

const verifyTicket = asyncHandler(async (req, res) => {
    const { ticketNumber } = req.body;
    const result = await ticketService.verifyTicketByStaff(ticketNumber, req.user.id);
    return apiResponse.success(res, result.message, result);
});

module.exports = {
    getTicket,
    verifyTicket
};
