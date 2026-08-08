const express = require("express");
const router = express.Router();
const screenController = require("../controllers/screenController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { screenValidator } = require("../validators/screenValidator");

router.get("/theatre/:theatreId", screenController.getScreensByTheatre);
router.get("/:id", screenController.getScreen);

router.post("/", authMiddleware, authorize("admin", "theatre_owner"), screenValidator, screenController.createScreen);
router.put("/:id", authMiddleware, authorize("admin", "theatre_owner"), screenController.updateScreen);
router.delete("/:id", authMiddleware, authorize("admin", "theatre_owner"), screenController.deleteScreen);

module.exports = router;
