const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true
        },

        genre: {
            type: String,
            required: true
        },

        language: {
            type: String,
            required: true
        },

        duration: {
            type: Number,
            required: true
        },

        releaseDate: {
            type: Date,
            required: true
        },

        certificate: {
            type: String,
            enum: ["U", "UA", "A"],
            required: true
        },

        poster: {
            type: String,
            default: ""
        },

        trailer: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["Coming Soon", "Now Showing"],
            default: "Coming Soon"
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