const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Movie title is required"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Movie description is required"]
        },
        genre: {
            type: String,
            required: [true, "Genre is required"]
        },
        language: {
            type: String,
            required: [true, "Language is required"]
        },
        duration: {
            type: Number,
            required: [true, "Duration in minutes is required"]
        },
        releaseDate: {
            type: Date,
            required: [true, "Release date is required"]
        },
        certificate: {
            type: String,
            enum: ["U", "UA", "A", "R"],
            required: [true, "Certificate is required"]
        },
        poster: {
            type: String,
            default: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80"
        },
        trailer: {
            type: String,
            default: ""
        },
        status: {
            type: String,
            enum: ["Coming Soon", "Now Showing", "Ended"],
            default: "Coming Soon"
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        numReviews: {
            type: Number,
            default: 0
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Movie", movieSchema);