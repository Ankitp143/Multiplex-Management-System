const Booking = require("../models/Booking");
const Movie = require("../models/Movie");
const Theatre = require("../models/Theatre");
const User = require("../models/User");
const Show = require("../models/Show");

const getDashboardStats = async (user) => {
    let bookingFilter = { bookingStatus: "Confirmed" };

    if (user.role === "theatre_owner") {
        const ownerTheatres = await Theatre.find({ owner: user.id }).select("_id");
        const theatreIds = ownerTheatres.map(t => t._id);
        const ownerShows = await Show.find({ theatre: { $in: theatreIds } }).select("_id");
        const showIds = ownerShows.map(s => s._id);
        bookingFilter.show = { $in: showIds };
    }

    const totalBookingsCount = await Booking.countDocuments(bookingFilter);
    
    const revenueAggregation = await Booking.aggregate([
        { $match: bookingFilter },
        { $group: { _id: null, totalRevenue: { $sum: "$finalAmount" } } }
    ]);
    const totalRevenue = revenueAggregation[0] ? revenueAggregation[0].totalRevenue : 0;

    const totalMovies = await Movie.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTheatres = await Theatre.countDocuments(user.role === "theatre_owner" ? { owner: user.id } : {});

    // Recent confirmed bookings
    const recentBookings = await Booking.find(bookingFilter)
        .populate("user", "firstName lastName email")
        .populate({
            path: "show",
            populate: [{ path: "movie", select: "title" }, { path: "theatre", select: "name" }]
        })
        .sort("-createdAt")
        .limit(5);

    return {
        totalBookingsCount,
        totalRevenue,
        totalMovies,
        totalUsers,
        totalTheatres,
        recentBookings
    };
};

const getRevenueReport = async (startDate, endDate, user) => {
    const filter = { bookingStatus: "Confirmed" };
    if (startDate && endDate) {
        filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    if (user.role === "theatre_owner") {
        const ownerTheatres = await Theatre.find({ owner: user.id }).select("_id");
        const theatreIds = ownerTheatres.map(t => t._id);
        const ownerShows = await Show.find({ theatre: { $in: theatreIds } }).select("_id");
        const showIds = ownerShows.map(s => s._id);
        filter.show = { $in: showIds };
    }

    const dailyRevenue = await Booking.aggregate([
        { $match: filter },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailyTotal: { $sum: "$finalAmount" },
                ticketCount: { $sum: "$noOfTickets" },
                bookingCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    return dailyRevenue;
};

module.exports = {
    getDashboardStats,
    getRevenueReport
};
