const express = require("express");
const router = express.Router();
const movieController = require("../controllers/movieController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { movieValidator } = require("../validators/movieValidator");

router.get("/setup-seed", movieController.forceSeedMovies);
router.post("/setup-seed", movieController.forceSeedMovies);
router.get("/seed", movieController.seedMovies);
router.post("/seed", movieController.seedMovies);
router.get("/", movieController.getMovies);
router.get("/:id", movieController.getMovie);

router.post("/", authMiddleware, authorize("admin", "theatre_owner"), movieValidator, movieController.createMovie);
router.put("/:id", authMiddleware, authorize("admin", "theatre_owner"), movieValidator, movieController.updateMovie);
router.delete("/:id", authMiddleware, authorize("admin"), movieController.deleteMovie);

module.exports = router;