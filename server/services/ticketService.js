const Ticket = require("../models/Ticket");
const Booking = require("../models/Booking");
const AppError = require("../utils/AppError");

const getTicketByBooking = async (bookingId) => {
    const ticket = await Ticket.findOne({
        $or: [{ booking: bookingId }, { ticketNumber: bookingId }]
    }).populate({
        path: "booking",
        populate: [
            { path: "user", select: "firstName lastName email phone" },
            {
                path: "show",
                populate: [{ path: "movie" }, { path: "theatre" }, { path: "screen" }]
            }
        ]
    });

    if (!ticket) {
        throw new AppError("Ticket not found", 404);
    }

    return ticket;
};

const verifyTicketByStaff = async (ticketNumber, staffId) => {
    const ticket = await Ticket.findOne({ ticketNumber }).populate({
        path: "booking",
        populate: [
            { path: "user", select: "firstName lastName email phone" },
            {
                path: "show",
                populate: [{ path: "movie" }, { path: "theatre" }, { path: "screen" }]
            }
        ]
    });

    if (!ticket) {
        throw new AppError("Invalid Ticket Number", 404);
    }

    if (ticket.status === "Used") {
        return { valid: false, message: `Ticket already verified at ${ticket.verifiedAt}`, ticket };
    }

    if (ticket.status === "Cancelled") {
        return { valid: false, message: "Ticket has been cancelled", ticket };
    }

    ticket.status = "Used";
    ticket.verifiedBy = staffId;
    ticket.verifiedAt = new Date();
    await ticket.save();

    return { valid: true, message: "Ticket Verified Successfully! Access Granted. ✅", ticket };
};

module.exports = {
    getTicketByBooking,
    verifyTicketByStaff
};
