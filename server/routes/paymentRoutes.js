const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");
const { paymentValidator } = require("../validators/paymentValidator");

router.post("/process", authMiddleware, paymentValidator, paymentController.processPayment);
router.get("/booking/:bookingId", authMiddleware, paymentController.getPaymentByBooking);

module.exports = router;
