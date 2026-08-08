const FoodOrder = require("../models/FoodOrder");
const Snack = require("../models/Snack");
const AppError = require("../utils/AppError");

const generateOrderId = () => {
    return "FOD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createFoodOrder = async (orderData, userId) => {
    const { bookingId, items } = orderData;

    let totalAmount = 0;
    const itemDetails = [];

    for (const item of items) {
        const snack = await Snack.findById(item.snackId);
        if (!snack) throw new AppError(`Snack not found for ID: ${item.snackId}`, 404);

        const itemTotal = snack.price * item.quantity;
        totalAmount += itemTotal;

        itemDetails.push({
            snack: snack._id,
            name: snack.name,
            price: snack.price,
            quantity: item.quantity
        });
    }

    const foodOrder = await FoodOrder.create({
        orderId: generateOrderId(),
        booking: bookingId || null,
        user: userId,
        items: itemDetails,
        totalAmount,
        status: "Pending"
    });

    return foodOrder;
};

const getUserFoodOrders = async (userId) => {
    return await FoodOrder.find({ user: userId }).sort("-createdAt");
};

const getAllFoodOrders = async () => {
    return await FoodOrder.find()
        .populate("user", "firstName lastName phone email")
        .sort("-createdAt");
};

const updateOrderStatus = async (orderId, status) => {
    const validStatuses = ["Pending", "Preparing", "Ready", "Delivered"];
    if (!validStatuses.includes(status)) {
        throw new AppError("Invalid order status", 400);
    }

    const order = await FoodOrder.findOneAndUpdate(
        { $or: [{ _id: orderId }, { orderId: orderId }] },
        { status },
        { new: true }
    );

    if (!order) throw new AppError("Food order not found", 404);

    return order;
};

module.exports = {
    createFoodOrder,
    getUserFoodOrders,
    getAllFoodOrders,
    updateOrderStatus
};
