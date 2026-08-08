const asyncHandler = require("../middleware/asyncHandler");
const screenService = require("../services/screenService");
const apiResponse = require("../utils/apiResponse");

const createScreen = asyncHandler(async (req, res) => {
    const screen = await screenService.createScreen(req.body, req.user);
    return apiResponse.success(res, "Screen created successfully", screen, 201);
});

const getScreensByTheatre = asyncHandler(async (req, res) => {
    const screens = await screenService.getScreensByTheatre(req.params.theatreId);
    return apiResponse.success(res, "Screens retrieved successfully", screens);
});

const getScreen = asyncHandler(async (req, res) => {
    const screen = await screenService.getScreenById(req.params.id);
    return apiResponse.success(res, "Screen details retrieved successfully", screen);
});

const updateScreen = asyncHandler(async (req, res) => {
    const screen = await screenService.updateScreen(req.params.id, req.body, req.user);
    return apiResponse.success(res, "Screen updated successfully", screen);
});

const deleteScreen = asyncHandler(async (req, res) => {
    await screenService.deleteScreen(req.params.id, req.user);
    return apiResponse.success(res, "Screen deleted successfully");
});

module.exports = {
    createScreen,
    getScreensByTheatre,
    getScreen,
    updateScreen,
    deleteScreen
};
