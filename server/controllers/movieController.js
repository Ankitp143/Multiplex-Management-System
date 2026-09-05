const asyncHandler = require("../middleware/asyncHandler");
const movieService = require("../services/movieService");
const apiResponse = require("../utils/apiResponse");

const createMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.createMovie(req.body, req.user.id);
    return apiResponse.success(res, "Movie created successfully", movie, 201);
});

const getMovies = asyncHandler(async (req, res) => {
    if (req.query.seed === "true" || req.query.reseed === "true") {
        const { seedDatabase } = require("../utils/seedData");
        console.log("🎬 Forced reseed requested via API parameter!");
        await seedDatabase();
    }
    const movies = await movieService.getAllMovies(req.query);
    return apiResponse.success(res, "Movies retrieved successfully", movies);
});

const getMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.getMovieById(req.params.id);
    return apiResponse.success(res, "Movie details retrieved successfully", movie);
});

const updateMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    return apiResponse.success(res, "Movie updated successfully", movie);
});

const deleteMovie = asyncHandler(async (req, res) => {
    await movieService.deleteMovie(req.params.id);
    return apiResponse.success(res, "Movie deleted successfully");
});

const seedMovies = asyncHandler(async (req, res) => {
    const { seedDatabase } = require("../utils/seedData");
    try {
        await seedDatabase();
        const movies = await movieService.getAllMovies();
        return apiResponse.success(res, "Database seeded successfully with 10 movies and active shows", movies);
    } catch (err) {
        console.error("Seed endpoint error:", err);
        return apiResponse.error(res, `Database seeding failed: ${err.message}`, 500);
    }
});

const forceSeedMovies = asyncHandler(async (req, res) => {
    const Movie = require("../models/Movie");
    const { seedDatabase, getMoviesData } = require("../utils/seedData");
    try {
        await seedDatabase();
        const movies = await Movie.find();
        return res.json({ success: true, message: "Database seeded successfully!", count: movies.length, movies });
    } catch (err) {
        console.error("Force seed error:", err);
        return res.status(500).json({ success: false, message: err.message, error: err.toString(), stack: err.stack });
    }
});

module.exports = {
    createMovie,
    getMovies,
    getMovie,
    updateMovie,
    deleteMovie,
    seedMovies,
    forceSeedMovies
};