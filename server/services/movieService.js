const Movie = require("../models/Movie");

const createMovie = async (movieData) => {
    const movie = await Movie.create(movieData);
    return movie;
};

const getAllMovies = async () => {
    return await Movie.find()
        .populate("createdBy", "firstName lastName email")
        .sort({ createdAt: -1 });
};

const getMovieById = async (id) => {
    return await Movie.findById(id)
        .populate("createdBy", "firstName lastName email");
};

const updateMovie = async (id, updatedData) => {
    return await Movie.findByIdAndUpdate(
        id,
        updatedData,
        {
            new: true,
            runValidators: true
        }
    );
};

const deleteMovie = async (id) => {
    return await Movie.findByIdAndDelete(id);
};

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
};