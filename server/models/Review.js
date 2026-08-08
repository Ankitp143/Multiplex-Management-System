const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        rating: {
            type: Number,
            required: [true, "Rating between 1 and 5 is required"],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: [true, "Review comment is required"],
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// Prevent user from submitting multiple reviews for the same movie
reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
