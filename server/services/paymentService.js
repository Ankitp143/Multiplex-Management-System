const QRCode = require("qrcode");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Ticket = require("../models/Ticket");
const Coupon = require("../models/Coupon");
const Notification = require("../models/Notification");
const AppError = require("../utils/AppError");

const generateTxnId = () => {
    return "TXN-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
};

const processPayment = async (paymentData, userId) => {
    const { bookingId, paymentMode, accountNo } = paymentData;

    const booking = await Booking.findById(bookingId).populate({
        path: "show",
        populate: [{ path: "movie" }, { path: "theatre" }, { path: "screen" }]
    });

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    if (booking.user.toString() !== userId.toString()) {
        throw new AppError("Unauthorized payment request", 403);
    }

    if (booking.bookingStatus === "Confirmed") {
        throw new AppError("Booking is already confirmed", 400);
    }

    const transactionId = generateTxnId();

    // Simulated Gateway Success (99% success rate simulation)
    const payment = await Payment.create({
        booking: booking._id,
        user: userId,
        amount: booking.finalAmount,
        paymentMode,
        accountNo: accountNo ? `**** ${accountNo.slice(-4)}` : "**** **** **** 1234",
        transactionId,
        paymentStatus: "Success"
    });

    // Update Booking status to Confirmed
    booking.bookingStatus = "Confirmed";
    await booking.save();

    // Mark seats as booked in Show model & clear user locks
    const show = await Show.findById(booking.show._id);
    if (show) {
        const bookedSeatNos = booking.seats.map(s => s.seatNo);
        show.bookedSeats.push(...bookedSeatNos);
        show.lockedSeats = show.lockedSeats.filter(l => l.userId.toString() !== userId.toString());
        await show.save();
    }

    // Increment coupon count if used
    if (booking.couponCode) {
        await Coupon.findOneAndUpdate(
            { code: booking.couponCode },
            { $inc: { usageCount: 1 } }
        );
    }

    // Generate Digital Ticket with QR Code
    const ticketPayload = JSON.stringify({
        ticketNo: `TKT-${booking.bookingId}`,
        bookingId: booking.bookingId,
        movie: booking.show.movie.title,
        theatre: booking.show.theatre.name,
        screen: booking.show.screen.name,
        seats: booking.seats.map(s => s.seatNo).join(", "),
        showDate: booking.show.showDate,
        startTime: booking.show.startTime
    });

    const qrCodeDataUrl = await QRCode.toDataURL(ticketPayload);

    const ticket = await Ticket.create({
        ticketNumber: `TKT-${booking.bookingId}`,
        booking: booking._id,
        qrCode: qrCodeDataUrl,
        status: "Valid"
    });

    // Create Notification
    await Notification.create({
        user: userId,
        title: "Booking Confirmed! 🎉",
        message: `Your booking for ${booking.show.movie.title} (${booking.seats.length} tickets) at ${booking.show.theatre.name} is confirmed! Ticket No: TKT-${booking.bookingId}`,
        type: "Booking"
    });

    // Send Ticket Email Notification
    try {
        const User = require("../models/User");
        const userObj = await User.findById(userId);
        if (userObj && userObj.email) {
            const { sendBookingConfirmation } = require("./emailService");
            sendBookingConfirmation(userObj.email, booking).catch(err => console.error("Email dispatch async error:", err.message));
        }
    } catch (e) {
        console.error("Ticket email error:", e.message);
    }

    return {
        payment,
        ticket,
        booking
    };
};

const getPaymentByBooking = async (bookingId) => {
    return await Payment.findOne({ booking: bookingId }).populate("user", "firstName lastName email");
};

module.exports = {
    processPayment,
    getPaymentByBooking
};
