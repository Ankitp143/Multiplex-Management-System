const asyncHandler = require("../middleware/asyncHandler");
const couponService = require("../services/couponService");
const apiResponse = require("../utils/apiResponse");

const createCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.createCoupon(req.body);
    return apiResponse.success(res, "Coupon created successfully", coupon, 201);
});

const getCoupons = asyncHandler(async (req, res) => {
    const coupons = await couponService.getCoupons();
    return apiResponse.success(res, "Coupons retrieved", coupons);
});

const validateCoupon = asyncHandler(async (req, res) => {
    const { code, bookingAmount } = req.body;
    const result = await couponService.validateCoupon(code, bookingAmount);
    return apiResponse.success(res, "Coupon applied successfully", result);
});

const updateCoupon = asyncHandler(async (req, res) => {
    const coupon = await couponService.updateCoupon(req.params.id, req.body);
    return apiResponse.success(res, "Coupon updated", coupon);
});

const deleteCoupon = asyncHandler(async (req, res) => {
    await couponService.deleteCoupon(req.params.id);
    return apiResponse.success(res, "Coupon deleted");
});

module.exports = {
    createCoupon,
    getCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon
};
