const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
    {
        seatNo: { type: String, required: true }, // e.g. A1, A2
        row: { type: String, required: true },
        number: { type: Number, required: true },
        type: {
            type: String,
            enum: ["Standard", "Premium", "VIP"],
            default: "Standard"
        },
        priceMultiplier: {
            type: Number,
            default: 1.0
        }
    },
    { _id: false }
);

const screenSchema = new mongoose.Schema(
    {
        theatre: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Theatre",
            required: true
        },
        name: {
            type: String,
            required: [true, "Screen name is required"],
            trim: true
        },
        screenType: {
            type: String,
            enum: ["2D", "3D", "IMAX", "4DX"],
            default: "2D"
        },
        seatingCapacity: {
            type: Number,
            required: [true, "Seating capacity is required"]
        },
        rows: {
            type: Number,
            default: 8
        },
        cols: {
            type: Number,
            default: 10
        },
        seatLayout: [seatSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Screen", screenSchema);
