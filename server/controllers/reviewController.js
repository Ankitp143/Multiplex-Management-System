const asyncHandler = require("../middleware/asyncHandler");
const reviewService = require("../services/reviewService");
const apiResponse = require("../utils/apiResponse");

const addReview = asyncHandler(async (req, res) => {
    const review = await reviewService.addReview(req.body, req.user.id);
    return apiResponse.success(res, "Review added successfully", review, 201);
});

const getMovieReviews = asyncHandler(async (req, res) => {
    const reviews = await reviewService.getMovieReviews(req.params.movieId);
    return apiResponse.success(res, "Reviews retrieved successfully", reviews);
});

const deleteReview = asyncHandler(async (req, res) => {
    await reviewService.deleteReview(req.params.id, req.user.id, req.user.role);
    return apiResponse.success(res, "Review deleted successfully");
});

module.exports = {
    addReview,
    getMovieReviews,
    deleteReview
};
