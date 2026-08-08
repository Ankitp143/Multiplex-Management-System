const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const authMiddleware = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { couponValidator, applyCouponValidator } = require("../validators/couponValidator");

router.get("/", couponController.getCoupons);
router.post("/validate", authMiddleware, applyCouponValidator, couponController.validateCoupon);

router.post("/", authMiddleware, authorize("admin"), couponValidator, couponController.createCoupon);
router.put("/:id", authMiddleware, authorize("admin"), couponController.updateCoupon);
router.delete("/:id", authMiddleware, authorize("admin"), couponController.deleteCoupon);

module.exports = router;
