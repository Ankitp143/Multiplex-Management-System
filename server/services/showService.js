const Show = require("../models/Show");
const Screen = require("../models/Screen");
const Theatre = require("../models/Theatre");
const Movie = require("../models/Movie");
const AppError = require("../utils/AppError");

const createShow = async (showData) => {
    const { movieId, theatreId, screenId, showDate, startTime, endTime, ticketPrice } = showData;

    const movie = await Movie.findById(movieId);
    if (!movie) throw new AppError("Movie not found", 404);

    const theatre = await Theatre.findById(theatreId);
    if (!theatre) throw new AppError("Theatre not found", 404);

    const screen = await Screen.findById(screenId);
    if (!screen) throw new AppError("Screen not found", 404);

    // Check for show overlap in the same screen
    const existingShows = await Show.find({
        screen: screenId,
        showDate: new Date(showDate),
        status: { $ne: "Cancelled" }
    });

    const hasOverlap = existingShows.some(s => s.startTime === startTime);
    if (hasOverlap) {
        throw new AppError("A show is already scheduled for this screen at the specified time", 400);
    }

    const show = await Show.create({
        movie: movieId,
        theatre: theatreId,
        screen: screenId,
        showDate,
        startTime,
        endTime,
        ticketPrice
    });

    return show;
};

const getShows = async (query = {}) => {
    // Check if 0 active shows exist in DB
    const activeShowCount = await Show.countDocuments({ status: { $ne: "Cancelled" } });
    if (activeShowCount === 0) {
        console.log("🎬 0 active shows found in database! Auto-triggering seed...");
        try {
            const { seedDatabase } = require("../utils/seedData");
            await seedDatabase();
        } catch (seedErr) {
            console.error("Auto-seed error in showService:", seedErr);
        }
    }

    const filter = { status: { $ne: "Cancelled" } };
    if (query.movieId) filter.movie = query.movieId;
    if (query.theatreId) filter.theatre = query.theatreId;
    if (query.showDate) {
        const dateObj = new Date(query.showDate);
        const startOfDay = new Date(dateObj);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateObj);
        endOfDay.setHours(23, 59, 59, 999);
        filter.showDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (query.city) {
        const theatresInCity = await Theatre.find({ city: new RegExp(query.city, "i") }).select("_id");
        const theatreIds = theatresInCity.map(t => t._id);
        filter.theatre = { $in: theatreIds };
    }

    return await Show.find(filter)
        .populate("movie", "title genre language duration certificate poster")
        .populate("theatre", "name city address")
        .populate("screen", "name screenType rows cols seatingCapacity")
        .sort("showDate startTime");
};

const getShowById = async (showId) => {
    const show = await Show.findById(showId)
        .populate("movie")
        .populate("theatre")
        .populate("screen");
    
    if (!show) {
        throw new AppError("Show not found", 404);
    }

    // Clean up expired locked seats
    const now = new Date();
    const activeLockedSeats = show.lockedSeats.filter(lock => lock.lockedUntil > now);
    if (activeLockedSeats.length !== show.lockedSeats.length) {
        show.lockedSeats = activeLockedSeats;
        await show.save();
    }

    return show;
};

const lockSeats = async (showId, seatNos, userId) => {
    const show = await Show.findById(showId);
    if (!show) throw new AppError("Show not found", 404);

    const now = new Date();
    // Clean expired locks
    show.lockedSeats = show.lockedSeats.filter(lock => lock.lockedUntil > now);

    // Check if any requested seat is booked or currently locked by someone else
    for (const seatNo of seatNos) {
        if (show.bookedSeats.includes(seatNo)) {
            throw new AppError(`Seat ${seatNo} is already booked`, 400);
        }
        const existingLock = show.lockedSeats.find(l => l.seatNo === seatNo);
        if (existingLock && existingLock.userId.toString() !== userId.toString()) {
            throw new AppError(`Seat ${seatNo} is currently locked by another customer`, 400);
        }
    }

    // Lock duration: 10 minutes
    const lockUntil = new Date(now.getTime() + 10 * 60 * 1000);

    // Update locks
    const newLocks = show.lockedSeats.filter(l => l.userId.toString() !== userId.toString());
    seatNos.forEach(seatNo => {
        newLocks.push({ seatNo, userId, lockedUntil: lockUntil });
    });

    show.lockedSeats = newLocks;
    await show.save();

    return { lockedSeats: seatNos, lockedUntil: lockUntil };
};

const updateShow = async (showId, updateData) => {
    const show = await Show.findByIdAndUpdate(showId, updateData, { new: true, runValidators: true });
    if (!show) throw new AppError("Show not found", 404);
    return show;
};

const deleteShow = async (showId) => {
    const show = await Show.findByIdAndUpdate(showId, { status: "Cancelled" }, { new: true });
    if (!show) throw new AppError("Show not found", 404);
    return true;
};

module.exports = {
    createShow,
    getShows,
    getShowById,
    lockSeats,
    updateShow,
    deleteShow
};
