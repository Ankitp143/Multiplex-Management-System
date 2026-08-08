const Review = require("../models/Review");
const Movie = require("../models/Movie");
const AppError = require("../utils/AppError");

// Helper to recalculate average rating for a movie
const updateMovieRatingStats = async (movieId) => {
    const reviews = await Review.find({ movie: movieId });
    const numReviews = reviews.length;
    const avgRating = numReviews > 0
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews) * 10) / 10
        : 0;

    await Movie.findByIdAndUpdate(movieId, {
        averageRating: avgRating,
        numReviews: numReviews
    });
};

const addReview = async (reviewData, userId) => {
    const { movieId, rating, comment } = reviewData;

    const movie = await Movie.findById(movieId);
    if (!movie) throw new AppError("Movie not found", 404);

    const existingReview = await Review.findOne({ movie: movieId, user: userId });
    if (existingReview) {
        throw new AppError("You have already reviewed this movie", 400);
    }

    const review = await Review.create({
        movie: movieId,
        user: userId,
        rating,
        comment
    });

    await updateMovieRatingStats(movieId);
    return review;
};

const getMovieReviews = async (movieId) => {
    return await Review.find({ movie: movieId })
        .populate("user", "firstName lastName")
        .sort("-createdAt");
};

const deleteReview = async (reviewId, userId, userRole) => {
    const review = await Review.findById(reviewId);
    if (!review) throw new AppError("Review not found", 404);

    if (userRole !== "admin" && review.user.toString() !== userId.toString()) {
        throw new AppError("Not authorized to delete this review", 403);
    }

    const movieId = review.movie;
    await review.deleteOne();
    await updateMovieRatingStats(movieId);
    return true;
};

module.exports = {
    addReview,
    getMovieReviews,
    deleteReview
};
