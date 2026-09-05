const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true,
        },
        role: {
            type: String,
            enum: ["admin", "theatre_owner", "staff", "customer"],
            default: "customer",
        },
        accountStatus: {
            type: String,
            enum: ["Active", "Inactive", "Blocked"],
            default: "Active",
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        resetOtp: String,
        resetOtpExpire: Date,
    },
    {
        timestamps: true,
    }
);

// Match user password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);