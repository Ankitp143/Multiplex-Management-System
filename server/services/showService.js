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

const ensureShowsForDate = async (targetDateStr, movieId = null) => {
    const [year, month, day] = targetDateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    let theatre = await Theatre.findOne();
    if (!theatre) {
        theatre = await Theatre.create({
            name: "PVR Grand Cinema", city: "Mumbai",
            address: "Phoenix Marketcity, Kurla West", phone: "022-67890123", totalScreens: 2
        });
    }

    let screens = await Screen.find({ theatre: theatre._id });
    if (!screens || screens.length === 0) screens = await Screen.find({});
    if (!screens || screens.length === 0) {
        const layout = [];
        ["A", "B", "C", "D", "E", "F"].forEach(r => {
            for (let c = 1; c <= 8; c++) {
                const type = (r === "E" || r === "F") ? "VIP" : (r === "C" || r === "D" ? "Premium" : "Standard");
                layout.push({ seatNo: `${r}${c}`, row: r, number: c, type, priceMultiplier: type === "VIP" ? 1.5 : 1.0 });
            }
        });
        const s1 = await Screen.create({ theatre: theatre._id, name: "Audi 1 (IMAX 3D)", screenType: "IMAX", seatingCapacity: 48, rows: 6, cols: 8, seatLayout: layout });
        const s2 = await Screen.create({ theatre: theatre._id, name: "Audi 2 (4DX)", screenType: "4DX", seatingCapacity: 48, rows: 6, cols: 8, seatLayout: layout });
        screens = [s1, s2];
    }

    const screen1 = screens[0];
    const screen2 = screens[1] || screens[0];

    let moviesToSchedule = [];
    if (movieId) {
        const m = await Movie.findById(movieId);
        if (m) moviesToSchedule.push(m);
    }
    if (moviesToSchedule.length === 0) {
        moviesToSchedule = await Movie.find({});
    }

    const newShows = [];
    const showTimes = [
        { start: "10:30", end: "13:30", price: 300 },
        { start: "14:00", end: "17:00", price: 320 },
        { start: "17:30", end: "20:30", price: 350 },
        { start: "21:00", end: "23:55", price: 380 }
    ];

    for (const movie of moviesToSchedule) {
        const existingCount = await Show.countDocuments({
            movie: movie._id,
            showDate: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: "Cancelled" }
        });

        if (existingCount === 0) {
            showTimes.forEach((st, idx) => {
                newShows.push({
                    movie: movie._id,
                    theatre: theatre._id,
                    screen: idx % 2 === 0 ? screen1._id : screen2._id,
                    showDate: startOfDay,
                    startTime: st.start,
                    endTime: st.end,
                    ticketPrice: st.price,
                    status: "Scheduled",
                    bookedSeats: []
                });
            });
        }
    }

    if (newShows.length > 0) {
        await Show.insertMany(newShows);
        console.log(`🎬 Dynamically scheduled ${newShows.length} shows across movies for date ${targetDateStr}`);
    }
};

const getShows = async (query = {}) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const targetDateStr = query.showDate
        ? (typeof query.showDate === 'string' ? query.showDate.split('T')[0] : new Date(query.showDate).toISOString().split('T')[0])
        : todayStr;

    await ensureShowsForDate(targetDateStr, query.movieId || null);

    const filter = { status: { $ne: "Cancelled" } };
    if (query.movieId) filter.movie = query.movieId;
    if (query.theatreId) filter.theatre = query.theatreId;

    const [year, month, day] = targetDateStr.split('-').map(Number);
    const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

    if (query.showDate) {
        filter.showDate = { $gte: startOfDay, $lte: endOfDay };
    } else {
        filter.showDate = { $gte: startOfDay };
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
