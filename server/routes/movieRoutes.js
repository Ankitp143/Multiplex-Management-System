const authorize = require("../middleware/roleMiddleware");
const express = require("express");

const router = express.Router();

const movieController = require("../controllers/movieController");
const { createMovieValidator } = require("../validators/movieValidator");
const authMiddleware = require("../middleware/authMiddleware");

// Create Movie
router.post(
    "/",
    authMiddleware,
    authorize("admin"),
    createMovieValidator,
    movieController.createMovie
);

// Get All Movies
router.get(
    "/",
    movieController.getAllMovies
);

// Get Movie By ID
router.get(
    "/:id",
    movieController.getMovieById
);

// Update Movie
router.put(
    "/:id",
    authMiddleware,
    authorize("admin"),
    createMovieValidator,
    movieController.updateMovie
);

// Delete Movie
router.delete(
    "/:id",
    authMiddleware,
    authorize("admin"),
    movieController.deleteMovie
);

module.exports = router;