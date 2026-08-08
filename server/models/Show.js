const mongoose = require("mongoose");

const lockedSeatSchema = new mongoose.Schema(
    {
        seatNo: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        lockedUntil: { type: Date, required: true }
    },
    { _id: false }
);

const showSchema = new mongoose.Schema(
    {
        movie: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theatre",
            required: true
        },
        screen: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Screen",
            required: true
        },
        showDate: {
            type: Date,
            required: [true, "Show date is required"]
        },
        startTime: {
            type: String,
            required: [true, "Start time is required"] // e.g. "14:30"
        },
        endTime: {
            type: String,
            required: [true, "End time is required"] // e.g. "17:00"
        },
        ticketPrice: {
            type: Number,
            required: [true, "Ticket price is required"]
        },
        status: {
            type: String,
            enum: ["Scheduled", "Cancelled", "Completed"],
            default: "Scheduled"
        },
        bookedSeats: [{ type: String }], // e.g. ["A1", "A2"]
        lockedSeats: [lockedSeatSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Show", showSchema);
