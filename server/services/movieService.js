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
    if (query.genre && typeof query.genre === "string" && query.genre.trim() && query.genre.toLowerCase() !== "all") {
        filter.genre = new RegExp(query.genre.trim(), "i");
    }
    if (query.language && typeof query.language === "string" && query.language.trim() && query.language.toLowerCase() !== "all") {
        filter.language = new RegExp(query.language.trim(), "i");
    }
    if (query.status && typeof query.status === "string" && query.status.trim() && query.status.toLowerCase() !== "all") {
        filter.status = query.status.trim();
    }
    if (query.search && typeof query.search === "string" && query.search.trim()) {
        filter.title = new RegExp(query.search.trim(), "i");
    }

    let count = await Movie.countDocuments({});
    if (query.seed === "true" || query.reseed === "true" || count < 10) {
        console.log(`🎬 Triggering full database seed... (count=${count}, seedParam=${query.seed})`);
        try {
            const { seedDatabase } = require("../utils/seedData");
            await seedDatabase();
        } catch (err) {
            console.error("Seed error, attempting direct insert:", err);
            const { getMoviesData } = require("../utils/seedData");
            if (getMoviesData) {
                await Movie.deleteMany({}).catch(() => {});
                await Movie.insertMany(getMoviesData()).catch(() => {});
            }
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