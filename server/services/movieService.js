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

    const totalCount = await Movie.countDocuments();
    if (totalCount === 0) {
        console.log("🎬 Database has 0 total movies! Auto-triggering seeding...");
        try {
            const { seedDatabase } = require("../utils/seedData");
            await seedDatabase();
        } catch (seedErr) {
            console.error("Auto-seed error in movieService:", seedErr);
        }
    }

    return await Movie.find(filter).sort("-createdAt");
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