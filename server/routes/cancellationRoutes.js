const express = require("express");
const router = express.Router();
const cancellationController = require("../controllers/cancellationController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.post("/request", authMiddleware, cancellationController.requestCancellation);
router.get("/my-cancellations", authMiddleware, cancellationController.getMyCancellations);
router.get("/all", authMiddleware, authorize("admin", "theatre_owner"), cancellationController.getAllCancellations);

module.exports = router;
