const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticketController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get("/booking/:bookingId", authMiddleware, ticketController.getTicket);
router.post("/verify", authMiddleware, authorize("admin", "staff"), ticketController.verifyTicket);

module.exports = router;
