const { validationResult } = require("express-validator");
const movieService = require("../services/movieService");
const apiResponse = require("../utils/apiResponse");

const createMovie = async (req, res, next) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return apiResponse.validationError(res, errors.array());
        }

        const movieData = {
            ...req.body,
            createdBy: req.user.id
        };

        const movie = await movieService.createMovie(movieData);

        return apiResponse.success(
            res,
            "Movie created successfully",
            movie,
            201
        );
    } catch (error) {
        next(error);
    }
};

const getAllMovies = async (req, res, next) => {
    try {
        const movies = await movieService.getAllMovies();

        return apiResponse.success(
            res,
            "Movies fetched successfully",
            movies
        );
    } catch (error) {
        next(error);
    }
};

const getMovieById = async (req, res, next) => {
    try {
        const movie = await movieService.getMovieById(req.params.id);

        if (!movie) {
            return apiResponse.notFound(res, "Movie not found");
        }

        return apiResponse.success(
            res,
            "Movie fetched successfully",
            movie
        );
    } catch (error) {
        next(error);
    }
};

const updateMovie = async (req, res, next) => {
    try {
        const movie = await movieService.updateMovie(
            req.params.id,
            req.body
        );

        if (!movie) {
            return apiResponse.notFound(res, "Movie not found");
        }

        return apiResponse.success(
            res,
            "Movie updated successfully",
            movie
        );
    } catch (error) {
        next(error);
    }
};

const deleteMovie = async (req, res, next) => {
    try {
        const movie = await movieService.deleteMovie(req.params.id);

        if (!movie) {
            return apiResponse.notFound(res, "Movie not found");
        }

        return apiResponse.success(
            res,
            "Movie deleted successfully"
        );
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createMovie,
    getAllMovies,
    getMovieById,
    updateMovie,
    deleteMovie
};