const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const errorHandler = require("./middleware/errorHandler");
const apiResponse = require("./utils/apiResponse");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const theatreRoutes = require("./routes/theatreRoutes");
const screenRoutes = require("./routes/screenRoutes");
const showRoutes = require("./routes/showRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const cancellationRoutes = require("./routes/cancellationRoutes");
const snackRoutes = require("./routes/snackRoutes");
const foodOrderRoutes = require("./routes/foodOrderRoutes");
const couponRoutes = require("./routes/couponRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: "*",
    credentials: true
}));

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again after 15 minutes."
    }
});
app.use("/api/", limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct Seed Route
app.get(["/seed-all", "/api/seed-all", "/seed-now", "/api/seed-now", "/api/seed-database", "/api/force-seed"], async (req, res) => {
    try {
        const Movie = require("./models/Movie");
        const Show = require("./models/Show");
        const { seedDatabase } = require("./utils/seedData");
        await seedDatabase();
        const movies = await Movie.find();
        const shows = await Show.find().populate("movie");
        return res.json({
            success: true,
            message: "Seeded database successfully!",
            moviesCount: movies.length,
            showsCount: shows.length,
            sampleShow: shows[0] ? { title: shows[0].movie?.title, date: shows[0].showDate } : null
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

app.get("/api/debug-theatre/:id", async (req, res) => {
    try {
        const Theatre = require("./models/Theatre");
        const Screen = require("./models/Screen");
        const screenService = require("./services/screenService");
        
        const theatreId = req.params.id;
        const theatre = await Theatre.findById(theatreId);
        const existingScreens = await Screen.find({ theatre: theatreId });
        const serviceScreens = await screenService.getScreensByTheatre(theatreId);
        
        return res.json({
            success: true,
            theatreId,
            theatreFound: !!theatre,
            theatreDetails: theatre,
            existingScreensCount: existingScreens.length,
            serviceScreensCount: serviceScreens.length,
            serviceScreens
        });
    } catch (e) {
        return res.status(500).json({ error: e.message, stack: e.stack });
    }
});

app.get("/api/debug-shows", async (req, res) => {
    try {
        const Show = require("./models/Show");
        const Movie = require("./models/Movie");
        const Theatre = require("./models/Theatre");
        const Screen = require("./models/Screen");
        const showService = require("./services/showService");

        const queryDate = req.query.date || "2026-09-06";
        const fetchedShows = await showService.getShows({ showDate: queryDate });
        const allShows = await Show.find().populate("movie");

        return res.json({
            success: true,
            fetchedForDateCount: fetchedShows.length,
            totalShowsInDb: allShows.length,
            showDates: [...new Set(allShows.map(s => s.showDate))],
            moviesCount: await Movie.countDocuments(),
            theatresCount: await Theatre.countDocuments(),
            screensCount: await Screen.countDocuments()
        });
    } catch (e) {
        return res.status(500).json({ error: e.message, stack: e.stack });
    }
});

// Health Check
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "🚀 Welcome to Multiplex Management System API",
        systemTime: new Date().toISOString()
    });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/cancellations", cancellationRoutes);
app.use("/api/snacks", snackRoutes);
app.use("/api/food-orders", foodOrderRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);

// 404 Handler
app.use((req, res, next) => {
    return apiResponse.notFound(res, `Route ${req.originalUrl} not found`);
});

// Global Error Handler (Always Last)
app.use(errorHandler);

module.exports = app;
