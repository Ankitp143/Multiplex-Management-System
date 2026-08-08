const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { bookingValidator } = require("../validators/bookingValidator");

router.post("/", authMiddleware, bookingValidator, bookingController.createBooking);
router.get("/user", authMiddleware, bookingController.getUserBookings);
router.get("/all", authMiddleware, authorize("admin", "staff", "theatre_owner"), bookingController.getAllBookings);
router.get("/:id", authMiddleware, bookingController.getBooking);

module.exports = router;
