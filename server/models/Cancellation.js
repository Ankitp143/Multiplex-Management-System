const mongoose = require("mongoose");

const cancellationSchema = new mongoose.Schema(
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
        refundAmount: {
            type: Number,
            required: true
        },
        refundStatus: {
            type: String,
            enum: ["Pending", "Processed", "Rejected"],
            default: "Pending"
        },
        reason: {
            type: String,
            default: "User requested cancellation"
        },
        processedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Cancellation", cancellationSchema);
