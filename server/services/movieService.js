const Movie = require("../models/Movie");
const AppError = require("../utils/AppError");

const createMovie = async (movieData, userId) => {
    const movie = await Movie.create({
        ...movieData,
        createdBy: userId
    });
    return movie;
};

const getAllMovies = async (query = {}) => {
    const filter = {};
    if (query.genre) filter.genre = new RegExp(query.genre, "i");
    if (query.language) filter.language = new RegExp(query.language, "i");
    if (query.status) filter.status = query.status;
    if (query.search) filter.title = new RegExp(query.search, "i");

    let movies = await Movie.find(filter).sort("-createdAt");

    // Automatic Seed Fallback if database is empty
    if (movies.length === 0 && (!query || Object.keys(query).length === 0)) {
        console.log("🎬 Database has 0 movies! Auto-triggering movie & show seeding...");
        try {
            const { seedDatabase } = require("../utils/seedData");
            await seedDatabase();
            movies = await Movie.find(filter).sort("-createdAt");
        } catch (seedErr) {
            console.error("Auto-seed error in movieService:", seedErr);
        }
    }

    return movies;
};

const getMovieById = async (movieId) => {
    const movie = await Movie.findById(movieId);
    if (!movie) {
        throw new AppError("Movie not found", 404);
    }
    return movie;
};

const updateMovie = async (movieId, updateData) => {
    const movie = await Movie.findByIdAndUpdate(movieId, updateData, {
        new: true,
        runValidators: true
    });
    if (!movie) {
        throw new AppError("Movie not found", 404);
    }
    return movie;
};

const deleteMovie = async (movieId) => {
    const movie = await Movie.findByIdAndDelete(movieId);
    if (!movie) {
        throw new AppError("Movie not found", 404);
    }
    return true;
};

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
};