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
        throw new AppError("This email address is already registered. Please log in or use a different email address.", 400);
    }

    // Only ONE theatre owner is allowed in the entire system
    if (role === "theatre_owner") {
        const ownerExists = await User.findOne({ role: "theatre_owner" });
        if (ownerExists) {
            throw new AppError("A Theatre Owner account already exists. Only one owner is allowed in the system.", 400);
        }
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
        throw new AppError("No account found with this email address. Please register first to sign in.", 404);
    }

    if (user.accountStatus === "Blocked") {
        throw new AppError("Your account has been blocked. Please contact support.", 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Incorrect password. Please verify your password and try again.", 401);
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
 * Check if a Theatre Owner already exists
 */
const checkOwnerExists = async () => {
    const owner = await User.findOne({ role: "theatre_owner" });
    return !!owner;
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

    const user = await User.findById(targetUserId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    if (user.role === "theatre_owner") {
        throw new AppError("The Theatre Owner account role and status cannot be modified", 403);
    }

    if (role === "theatre_owner") {
        throw new AppError("Cannot assign Theatre Owner role. Theatre Owner accounts must register separately", 400);
    }

    if (role) user.role = role;
    if (accountStatus) user.accountStatus = accountStatus;
    await user.save();
    return user;
};

/**
 * Delete User with Role Hierarchy Enforcement
 * - Theatre Owner can remove Admin, Staff, and Customer
 * - Admin can remove Staff only
 */
const deleteUser = async (targetUserId, currentUser) => {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    // Cannot delete yourself
    if (targetUser._id.toString() === currentUser.id.toString()) {
        throw new AppError("You cannot remove your own account", 400);
    }

    if (currentUser.role === "theatre_owner") {
        // Owner can remove admin, staff, or customer — but NOT another owner
        if (targetUser.role === "theatre_owner") {
            throw new AppError("Cannot remove the Theatre Owner account", 403);
        }
    } else if (currentUser.role === "admin") {
        // Admin can only remove staff
        if (targetUser.role !== "staff") {
            throw new AppError("Admin can only remove Staff accounts", 403);
        }
    } else {
        throw new AppError("Not authorized to remove users", 403);
    }

    await targetUser.deleteOne();
    return true;
};

/**
 * Forgot Password - Send 6-Digit Email OTP
 */
const forgotPassword = async (email) => {
    if (!email) {
        throw new AppError("Please provide an email address", 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AppError("No account found with this email address", 404);
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpire = otpExpire;
    await user.save();

    const { sendPasswordResetOTP } = require("./emailService");
    await sendPasswordResetOTP(user.email, otp);

    return {
        message: `OTP sent successfully to ${user.email}`,
        // Included for easy local testing/verification
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
    };
};

/**
 * Verify Email OTP
 */
const verifyOtp = async (email, otp) => {
    if (!email || !otp) {
        throw new AppError("Email and OTP are required", 400);
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
        resetOtp: otp,
        resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError("Invalid or expired OTP code", 400);
    }

    return { valid: true, message: "OTP verified successfully" };
};

/**
 * Reset Password with Verified OTP
 */
const resetPassword = async (email, otp, newPassword) => {
    if (!email || !otp || !newPassword) {
        throw new AppError("Email, OTP, and new password are required", 400);
    }

    if (newPassword.length < 6) {
        throw new AppError("Password must be at least 6 characters", 400);
    }

    const user = await User.findOne({
        email: email.toLowerCase(),
        resetOtp: otp,
        resetOtpExpire: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError("Invalid or expired OTP code", 400);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = undefined;
    user.resetOtpExpire = undefined;
    await user.save();

    return { message: "Password reset successful! You can now log in with your new password." };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    checkOwnerExists,
    getAllUsers,
    updateUserByAdmin,
    deleteUser,
    forgotPassword,
    verifyOtp,
    resetPassword
};