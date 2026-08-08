const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paymentMode: {
            type: String,
            enum: ["Credit Card", "Debit Card", "UPI", "Net Banking"],
            required: true
        },
        accountNo: {
            type: String,
            default: "**** **** **** 1234"
        },
        transactionId: {
            type: String,
            required: true,
            unique: true
        },
        paymentStatus: {
            type: String,
            enum: ["Success", "Failed", "Pending"],
            default: "Pending"
        },
        transactionDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
