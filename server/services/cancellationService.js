const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Ticket = require("../models/Ticket");
const Cancellation = require("../models/Cancellation");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const requestCancellation = async (bookingId, reason, userId) => {
    const booking = await Booking.findById(bookingId).populate("show");
    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    if (booking.user.toString() !== userId.toString()) {
        throw new AppError("Not authorized to cancel this booking", 403);
    }

    if (booking.bookingStatus === "Cancelled") {
        throw new AppError("Booking is already cancelled", 400);
    }

    // Refund policy: 85% refund of finalAmount if Confirmed, 0 if Pending
    const refundAmount = booking.bookingStatus === "Confirmed" ? Math.round(booking.finalAmount * 0.85) : 0;

    booking.bookingStatus = "Cancelled";
    await booking.save();

    // Release seats in Show model
    if (booking.show) {
        const show = await Show.findById(booking.show._id || booking.show);
        if (show) {
            const seatNosToRelease = booking.seats.map(s => s.seatNo);
            show.bookedSeats = show.bookedSeats.filter(s => !seatNosToRelease.includes(s));
            show.lockedSeats = show.lockedSeats.filter(l => l.userId.toString() !== userId.toString());
            await show.save();
        }
    }

    // Cancel ticket if exists
    await Ticket.findOneAndUpdate({ booking: booking._id }, { status: "Cancelled" });

    // Create Cancellation Record
    const cancellation = await Cancellation.create({
        booking: booking._id,
        user: userId,
        refundAmount,
        refundStatus: refundAmount > 0 ? "Processed" : "N/A",
        reason: reason || "User requested cancellation",
        processedAt: new Date()
    });

    // Create Notification
    await Notification.create({
        user: userId,
        title: "Booking Cancelled ℹ️",
        message: `Your booking ${booking.bookingId} has been cancelled. A refund of ₹${refundAmount} has been processed.`,
        type: "Cancellation"
    });

    return cancellation;
};

const getCancellationsByUser = async (userId) => {
    return await Cancellation.find({ user: userId }).populate("booking");
};

const getAllCancellations = async () => {
    return await Cancellation.find()
        .populate("user", "firstName lastName email phone")
        .populate("booking");
};

module.exports = {
    requestCancellation,
    getCancellationsByUser,
    getAllCancellations
};
