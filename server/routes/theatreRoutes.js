const express = require("express");
const router = express.Router();
const theatreController = require("../controllers/theatreController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { theatreValidator } = require("../validators/theatreValidator");

router.get("/", theatreController.getTheatres);
router.get("/:id", theatreController.getTheatre);

router.post("/", authMiddleware, authorize("admin", "theatre_owner"), theatreValidator, theatreController.createTheatre);
router.put("/:id", authMiddleware, authorize("admin", "theatre_owner"), theatreValidator, theatreController.updateTheatre);
router.delete("/:id", authMiddleware, authorize("admin", "theatre_owner"), theatreController.deleteTheatre);

module.exports = router;
