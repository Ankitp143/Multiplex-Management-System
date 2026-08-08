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

router.post("/register", registerValidator, authController.register);
router.post("/login", loginValidator, authController.login);

router.get("/profile", authMiddleware, authController.getProfile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.post("/change-password", authMiddleware, changePasswordValidator, authController.changePassword);

// Admin user management
router.get("/users", authMiddleware, authorize("admin"), authController.getAllUsers);
router.put("/users/:id", authMiddleware, authorize("admin"), authController.updateUserByAdmin);

module.exports = router;