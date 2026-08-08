const mongoose = require("mongoose");

const snackSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Snack name is required"],
            trim: true
        },
        category: {
            type: String,
            enum: ["Popcorn", "Beverage", "Combos", "Snacks"],
            default: "Snacks"
        },
        price: {
            type: Number,
            required: [true, "Price is required"]
        },
        description: {
            type: String,
            default: ""
        },
        image: {
            type: String,
            default: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80"
        },
        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Snack", snackSchema);
