const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
    registerValidator,
    loginValidator,
    changePasswordValidator
} = require("../validators/authValidator");

router.get("/check-owner", authController.checkOwnerExists);
router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);

router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/change-password", authMiddleware, changePasswordValidator, authController.changePassword);

// Admin user management
router.get("/users", authMiddleware, authorize("admin", "theatre_owner"), authController.getAllUsers);
router.put("/users/:id", authMiddleware, authorize("admin"), authController.updateUserByAdmin);
router.delete("/users/:id", authMiddleware, authorize("admin", "theatre_owner"), authController.deleteUser);

module.exports = router;