const mongoose = require("mongoose");

const foodOrderItemSchema = new mongoose.Schema(
    {
        snack: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Snack",
            required: true
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    },
    { _id: false }
);

const foodOrderSchema = new mongoose.Schema(
    {
        orderId: {
            type: String,
            required: true,
            unique: true
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [foodOrderItemSchema],
        totalAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Preparing", "Ready", "Delivered"],
            default: "Pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
