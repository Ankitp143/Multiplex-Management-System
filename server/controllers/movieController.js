const asyncHandler = require("../middleware/asyncHandler");
const movieService = require("../services/movieService");
const apiResponse = require("../utils/apiResponse");

const createMovie = asyncHandler(async (req, res) => {
    const movie = await movieService.createMovie(req.body, req.user.id);
    return apiResponse.success(res, "Movie created successfully", movie, 201);
});

const getMovies = asyncHandler(async (req, res) => {
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
    const success = await seedDatabase();
    if (success) {
        const movies = await movieService.getAllMovies();
        return apiResponse.success(res, "Database seeded successfully with 10 movies and active shows", movies);
    }
    return apiResponse.error(res, "Database seeding failed", 500);
});

module.exports = {
    createMovie,
    getMovies,
    getMovie,
    updateMovie,
    deleteMovie,
    seedMovies
};