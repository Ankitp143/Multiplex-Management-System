const mongoose = require("mongoose");

const theatreSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Theatre name is required"],
            trim: true
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true
        },
        address: {
            type: String,
            required: [true, "Address is required"]
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"]
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        totalScreens: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Theatre", theatreSchema);
