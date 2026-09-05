const asyncHandler = require("../middleware/asyncHandler");
const authService = require("../services/authService");
const apiResponse = require("../utils/apiResponse");

const register = asyncHandler(async (req, res) => {
    const data = await authService.registerUser(req.body);
    return apiResponse.success(res, "Registration successful", data, 201);
});

const login = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    const data = await authService.loginUser(email, password, role);
    return apiResponse.success(res, "Login successful", data);
});

const getProfile = asyncHandler(async (req, res) => {
    const user = await authService.getUserProfile(req.user.id);
    return apiResponse.success(res, "Profile retrieved successfully", user);
});

const updateProfile = asyncHandler(async (req, res) => {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    return apiResponse.success(res, "Profile updated successfully", user);
});

const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user.id, currentPassword, newPassword);
    return apiResponse.success(res, "Password changed successfully");
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await authService.getAllUsers();
    return apiResponse.success(res, "Users retrieved successfully", users);
});

const updateUserByAdmin = asyncHandler(async (req, res) => {
    const user = await authService.updateUserByAdmin(req.params.id, req.body);
    return apiResponse.success(res, "User updated successfully", user);
});

const deleteUser = asyncHandler(async (req, res) => {
    await authService.deleteUser(req.params.id, req.user);
    return apiResponse.success(res, "User removed successfully");
});

const checkOwnerExists = asyncHandler(async (req, res) => {
    const ownerExists = await authService.checkOwnerExists();
    return apiResponse.success(res, "Owner check complete", { ownerExists });
});

const forgotPassword = asyncHandler(async (req, res) => {
    const data = await authService.forgotPassword(req.body.email);
    return apiResponse.success(res, data.message, data);
});

const verifyOtp = asyncHandler(async (req, res) => {
    const data = await authService.verifyOtp(req.body.email, req.body.otp);
    return apiResponse.success(res, data.message, data);
});

const resetPassword = asyncHandler(async (req, res) => {
    const data = await authService.resetPassword(req.body.email, req.body.otp, req.body.newPassword);
    return apiResponse.success(res, data.message, data);
});

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getAllUsers,
    updateUserByAdmin,
    deleteUser,
    checkOwnerExists,
    forgotPassword,
    verifyOtp,
    resetPassword
};