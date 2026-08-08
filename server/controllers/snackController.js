const asyncHandler = require("../middleware/asyncHandler");
const snackService = require("../services/snackService");
const apiResponse = require("../utils/apiResponse");

const createSnack = asyncHandler(async (req, res) => {
    const snack = await snackService.createSnack(req.body);
    return apiResponse.success(res, "Snack created successfully", snack, 201);
});

const getSnacks = asyncHandler(async (req, res) => {
    const snacks = await snackService.getSnacks(req.query);
    return apiResponse.success(res, "Snacks retrieved successfully", snacks);
});

const getSnack = asyncHandler(async (req, res) => {
    const snack = await snackService.getSnackById(req.params.id);
    return apiResponse.success(res, "Snack details retrieved", snack);
});

const updateSnack = asyncHandler(async (req, res) => {
    const snack = await snackService.updateSnack(req.params.id, req.body);
    return apiResponse.success(res, "Snack updated successfully", snack);
});

const deleteSnack = asyncHandler(async (req, res) => {
    await snackService.deleteSnack(req.params.id);
    return apiResponse.success(res, "Snack deleted successfully");
});

module.exports = {
    createSnack,
    getSnacks,
    getSnack,
    updateSnack,
    deleteSnack
};
