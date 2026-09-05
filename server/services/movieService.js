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
    if (query.genre && typeof query.genre === "string" && query.genre.trim()) {
        filter.genre = new RegExp(query.genre.trim(), "i");
    }
    if (query.language && typeof query.language === "string" && query.language.trim()) {
        filter.language = new RegExp(query.language.trim(), "i");
    }
    if (query.status && typeof query.status === "string" && query.status.trim() && query.status !== "all") {
        filter.status = query.status.trim();
    }
    if (query.search && typeof query.search === "string" && query.search.trim()) {
        filter.title = new RegExp(query.search.trim(), "i");
    }

    let count = await Movie.countDocuments({});
    if (count === 0) {
        console.log("🎬 Movie database is empty! Seeding 10 movies now...");
        try {
            const { MOVIES_DATA, seedDatabase } = require("../utils/seedData");
            await seedDatabase();
        } catch (err) {
            console.error("Seed error, attempting direct insert:", err);
            const { MOVIES_DATA } = require("../utils/seedData");
            if (MOVIES_DATA) await Movie.insertMany(MOVIES_DATA).catch(() => {});
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