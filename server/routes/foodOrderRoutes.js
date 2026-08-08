const express = require("express");
const router = express.Router();
const foodOrderController = require("../controllers/foodOrderController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, foodOrderController.createOrder);
router.get("/user", authMiddleware, foodOrderController.getMyOrders);
router.get("/all", authMiddleware, authorize("admin", "staff", "theatre_owner"), foodOrderController.getAllOrders);
router.put("/:id/status", authMiddleware, authorize("admin", "staff", "theatre_owner"), foodOrderController.updateStatus);

module.exports = router;
