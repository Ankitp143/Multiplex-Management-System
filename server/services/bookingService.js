const Booking = require("../models/Booking");
const Show = require("../models/Show");
const Screen = require("../models/Screen");
const Coupon = require("../models/Coupon");
const AppError = require("../utils/AppError");

// Utility to generate unique booking ID (e.g. MMS-89F1A2)
const generateBookingId = () => {
    return "MMS-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createBooking = async (bookingData, userId) => {
    const { showId, seats, foodOrderAmount = 0, couponCode } = bookingData;

    const show = await Show.findById(showId).populate("screen");
    if (!show) throw new AppError("Show not found", 404);

    if (show.status !== "Scheduled") {
        throw new AppError("This show is not available for booking", 400);
    }

    // Verify seat availability
    const requestedSeatNos = seats.map(s => s.seatNo);
    const now = new Date();

    for (const seatNo of requestedSeatNos) {
        if (show.bookedSeats.includes(seatNo)) {
            throw new AppError(`Seat ${seatNo} is already booked`, 400);
        }
    }

    // Calculate ticket amounts based on seat types in Screen layout
    const screenLayout = show.screen.seatLayout || [];
    let totalTicketAmount = 0;

    const seatDetails = seats.map(s => {
        const layoutSeat = screenLayout.find(ls => ls.seatNo === s.seatNo);
        const multiplier = layoutSeat ? layoutSeat.priceMultiplier : 1.0;
        const seatType = layoutSeat ? layoutSeat.type : "Standard";
        const price = Math.round(show.ticketPrice * multiplier);
        totalTicketAmount += price;

        return {
            seatNo: s.seatNo,
            type: seatType,
            price
        };
    });

    let discountAmount = 0;

    // Validate Coupon if provided
    if (couponCode) {
        const coupon = await Coupon.findOne({
            code: couponCode.toUpperCase(),
            isActive: true,
            validUntil: { $gte: new Date() }
        });

        if (coupon && (totalTicketAmount + foodOrderAmount) >= coupon.minBookingAmount) {
            if (coupon.discountPercentage > 0) {
                discountAmount = Math.min(
                    Math.round(((totalTicketAmount + foodOrderAmount) * coupon.discountPercentage) / 100),
                    coupon.maxDiscount
                );
            } else if (coupon.discountAmount > 0) {
                discountAmount = Math.min(coupon.discountAmount, coupon.maxDiscount);
            }
        }
    }

    const finalAmount = Math.max(0, totalTicketAmount + foodOrderAmount - discountAmount);
    const bId = generateBookingId();

    const booking = await Booking.create({
        bookingId: bId,
        user: userId,
        show: showId,
        seats: seatDetails,
        noOfTickets: seats.length,
        totalTicketAmount,
        foodOrderAmount,
        discountAmount,
        finalAmount,
        couponCode: couponCode || "",
        bookingStatus: "Pending"
    });

    return booking;
};

const getUserBookings = async (userId) => {
    return await Booking.find({ user: userId })
        .populate({
            path: "show",
            populate: [
                { path: "movie", select: "title genre language certificate poster duration" },
                { path: "theatre", select: "name city address" },
                { path: "screen", select: "name screenType" }
            ]
        })
        .sort("-createdAt");
};

const getBookingById = async (bookingId, userId, userRole) => {
    const booking = await Booking.findOne({
        $or: [{ _id: bookingId }, { bookingId: bookingId }]
    }).populate({
        path: "show",
        populate: [
            { path: "movie" },
            { path: "theatre" },
            { path: "screen" }
        ]
    }).populate("user", "firstName lastName email phone");

    if (!booking) {
        throw new AppError("Booking not found", 404);
    }

    if (userRole !== "admin" && userRole !== "staff" && userRole !== "theatre_owner" && booking.user._id.toString() !== userId.toString()) {
        throw new AppError("Not authorized to access this booking", 403);
    }

    return booking;
};

const getAllBookings = async () => {
    return await Booking.find()
        .populate("user", "firstName lastName email phone")
        .populate({
            path: "show",
            populate: [{ path: "movie", select: "title" }, { path: "theatre", select: "name city" }]
        })
        .sort("-createdAt");
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    getAllBookings
};
