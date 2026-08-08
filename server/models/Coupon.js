const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, "Coupon code is required"],
            unique: true,
            uppercase: true,
            trim: true
        },
        discountPercentage: {
            type: Number,
            default: 0
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        maxDiscount: {
            type: Number,
            default: 500
        },
        minBookingAmount: {
            type: Number,
            default: 200
        },
        validUntil: {
            type: Date,
            required: [true, "Expiration date is required"]
        },
        isActive: {
            type: Boolean,
            default: true
        },
        usageCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Coupon", couponSchema);
