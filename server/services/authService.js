const bcrypt = require("bcrypt");
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const AppError = require("../utils/AppError");

/**
 * Register New User
 */
const registerUser = async (userData) => {
    const { firstName, lastName, email, password, phone, role } = userData;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        throw new AppError("Email already registered", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        role: role || "customer"
    });

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accountStatus: user.accountStatus
        }
    };
};

/**
 * Login User
 */
const loginUser = async (email, password, expectedRole) => {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
        throw new AppError("Invalid email or password", 401);
    }

    if (user.accountStatus === "Blocked") {
        throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    if (expectedRole && user.role !== expectedRole) {
        const readableRole = expectedRole === 'theatre_owner' ? 'Theatre Owner' : expectedRole.charAt(0).toUpperCase() + expectedRole.slice(1);
        const userReadableRole = user.role === 'theatre_owner' ? 'Theatre Owner' : user.role.charAt(0).toUpperCase() + user.role.slice(1);
        throw new AppError(`Access Denied: This account is registered as '${userReadableRole}', not '${readableRole}'. Please switch to the correct portal.`, 403);
    }

    const token = generateToken(user);

    return {
        token,
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            role: user.role,
            accountStatus: user.accountStatus
        }
    };
};

/**
 * Get User Profile
 */
const getUserProfile = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

/**
 * Update User Profile
 */
const updateUserProfile = async (userId, updateData) => {
    const { firstName, lastName, phone } = updateData;
    const user = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, phone },
        { new: true, runValidators: true }
    );
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

/**
 * Change Password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    const user = await User.findById(userId).select("+password");
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
        throw new AppError("Current password is incorrect", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    return true;
};

/**
 * Admin: Get All Users
 */
const getAllUsers = async () => {
    return await User.find().sort("-createdAt");
};

/**
 * Admin: Update User Status / Role
 */
const updateUserByAdmin = async (targetUserId, updateData) => {
    const { role, accountStatus } = updateData;
    const user = await User.findByIdAndUpdate(
        targetUserId,
        { role, accountStatus },
        { new: true, runValidators: true }
    );
    if (!user) {
        throw new AppError("User not found", 404);
    }
    return user;
};

/**
 * Delete User with Role Hierarchy Enforcement
 * - Theatre Owner can remove Admin and Staff
 * - Admin can remove Staff
 */
const deleteUser = async (targetUserId, currentUser) => {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    if (currentUser.role === "theatre_owner") {
        if (targetUser.role !== "admin" && targetUser.role !== "staff") {
            throw new AppError("Theatre Owner can only remove Admin and Staff accounts", 403);
        }
    } else if (currentUser.role === "admin") {
        if (targetUser.role !== "staff") {
            throw new AppError("Admin can only remove Staff accounts", 403);
        }
    } else {
        throw new AppError("Not authorized to remove users", 403);
    }

    await targetUser.deleteOne();
    return true;
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAllUsers,
    updateUserByAdmin,
    deleteUser
};