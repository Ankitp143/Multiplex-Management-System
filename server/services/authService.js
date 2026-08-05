const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/**
 * Register New User
 */
const registerUser = async (userData) => {
    const { firstName, lastName, email, password, phone } = userData;

    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
    });

    return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
    };
};

/**
 * Login User
 */
const loginUser = async (email, password) => {

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Compare Password
    const isPasswordMatched = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordMatched) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT
    const token = generateToken(user);

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        },
    };
};

module.exports = {
    registerUser,
    loginUser,
};