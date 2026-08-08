const Coupon = require("../models/Coupon");
const AppError = require("../utils/AppError");

const createCoupon = async (couponData) => {
    const existing = await Coupon.findOne({ code: couponData.code.toUpperCase() });
    if (existing) {
        throw new AppError("Coupon code already exists", 400);
    }

    return await Coupon.create({
        ...couponData,
        code: couponData.code.toUpperCase()
    });
};

const getCoupons = async () => {
    return await Coupon.find().sort("-createdAt");
};

const validateCoupon = async (code, bookingAmount) => {
    const coupon = await Coupon.findOne({
        code: code.toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() }
    });

    if (!coupon) {
        throw new AppError("Invalid or expired coupon code", 404);
    }

    if (bookingAmount < coupon.minBookingAmount) {
        throw new AppError(`Minimum booking amount for this coupon is ₹${coupon.minBookingAmount}`, 400);
    }

    let discount = 0;
    if (coupon.discountPercentage > 0) {
        discount = Math.min(
            Math.round((bookingAmount * coupon.discountPercentage) / 100),
            coupon.maxDiscount
        );
    } else if (coupon.discountAmount > 0) {
        discount = Math.min(coupon.discountAmount, coupon.maxDiscount);
    }

    return {
        valid: true,
        code: coupon.code,
        discountAmount: discount,
        minBookingAmount: coupon.minBookingAmount
    };
};

const updateCoupon = async (id, updateData) => {
    if (updateData.code) updateData.code = updateData.code.toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!coupon) throw new AppError("Coupon not found", 404);
    return coupon;
};

const deleteCoupon = async (id) => {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) throw new AppError("Coupon not found", 404);
    return true;
};

module.exports = {
    createCoupon,
    getCoupons,
    validateCoupon,
    updateCoupon,
    deleteCoupon
};
