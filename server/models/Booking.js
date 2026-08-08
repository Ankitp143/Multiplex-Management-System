const mongoose = require("mongoose");

const bookedSeatDetailSchema = new mongoose.Schema(
    {
        seatNo: { type: String, required: true },
        type: { type: String, default: "Standard" },
        price: { type: Number, required: true }
    },
    { _id: false }
);

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            required: true,
            unique: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        show: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Show",
            required: true
        },
        seats: [bookedSeatDetailSchema],
        noOfTickets: {
            type: Number,
            required: true
        },
        totalTicketAmount: {
            type: Number,
            required: true
        },
        foodOrderAmount: {
            type: Number,
            default: 0
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        finalAmount: {
            type: Number,
            required: true
        },
        couponCode: {
            type: String,
            default: ""
        },
        bookingStatus: {
            type: String,
            enum: ["Pending", "Confirmed", "Cancelled"],
            default: "Pending"
        },
        bookingDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Booking", bookingSchema);
