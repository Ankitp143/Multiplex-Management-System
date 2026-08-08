const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authMiddleware");
const { reviewValidator } = require("../validators/reviewValidator");

router.get("/movie/:movieId", reviewController.getMovieReviews);
router.post("/", authMiddleware, reviewValidator, reviewController.addReview);
router.delete("/:id", authMiddleware, reviewController.deleteReview);

module.exports = router;
