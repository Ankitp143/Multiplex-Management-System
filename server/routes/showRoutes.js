const express = require("express");
const router = express.Router();
const showController = require("../controllers/showController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { showValidator, lockSeatValidator } = require("../validators/showValidator");

router.get("/", showController.getShows);
router.get("/system/seed-shows", async (req, res) => {
    const { seedDatabase } = require("../utils/seedData");
    try {
        await seedDatabase();
        const Show = require("../models/Show");
        const shows = await Show.find().populate("movie");
        return res.json({ success: true, count: shows.length, message: "Shows reseeded successfully across 14 rolling days!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/:id", showController.getShow);

router.post("/", authMiddleware, authorize("admin", "theatre_owner"), showValidator, showController.createShow);
router.put("/:id", authMiddleware, authorize("admin", "theatre_owner"), showController.updateShow);
router.delete("/:id", authMiddleware, authorize("admin", "theatre_owner"), showController.deleteShow);

router.post("/:id/lock-seats", authMiddleware, lockSeatValidator, showController.lockSeats);

module.exports = router;
