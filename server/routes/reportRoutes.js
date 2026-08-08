const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get("/dashboard", authMiddleware, authorize("admin", "theatre_owner"), reportController.getDashboardStats);
router.get("/revenue", authMiddleware, authorize("admin", "theatre_owner"), reportController.getRevenueReport);

module.exports = router;
