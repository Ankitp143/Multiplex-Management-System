const asyncHandler = require("../middleware/asyncHandler");
const foodOrderService = require("../services/foodOrderService");
const apiResponse = require("../utils/apiResponse");

const createOrder = asyncHandler(async (req, res) => {
    const order = await foodOrderService.createFoodOrder(req.body, req.user.id);
    return apiResponse.success(res, "Food order placed successfully", order, 201);
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await foodOrderService.getUserFoodOrders(req.user.id);
    return apiResponse.success(res, "Orders retrieved successfully", orders);
});

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await foodOrderService.getAllFoodOrders();
    return apiResponse.success(res, "All food orders retrieved", orders);
});

const updateStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const order = await foodOrderService.updateOrderStatus(req.params.id, status);
    return apiResponse.success(res, `Order status updated to ${status}`, order);
});

module.exports = {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateStatus
};
