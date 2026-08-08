const express = require("express");
const router = express.Router();
const snackController = require("../controllers/snackController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { snackValidator } = require("../validators/snackValidator");

router.get("/", snackController.getSnacks);
router.get("/:id", snackController.getSnack);

router.post("/", authMiddleware, authorize("admin", "theatre_owner"), snackValidator, snackController.createSnack);
router.put("/:id", authMiddleware, authorize("admin", "theatre_owner"), snackController.updateSnack);
router.delete("/:id", authMiddleware, authorize("admin"), snackController.deleteSnack);

module.exports = router;
