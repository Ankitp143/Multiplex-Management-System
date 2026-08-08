const asyncHandler = require("../middleware/asyncHandler");
const showService = require("../services/showService");
const apiResponse = require("../utils/apiResponse");

const createShow = asyncHandler(async (req, res) => {
    const show = await showService.createShow(req.body);
    return apiResponse.success(res, "Show scheduled successfully", show, 201);
});

const getShows = asyncHandler(async (req, res) => {
    const shows = await showService.getShows(req.query);
    return apiResponse.success(res, "Shows retrieved successfully", shows);
});

const getShow = asyncHandler(async (req, res) => {
    const show = await showService.getShowById(req.params.id);
    return apiResponse.success(res, "Show details retrieved successfully", show);
});

const lockSeats = asyncHandler(async (req, res) => {
    const { seatNos } = req.body;
    const result = await showService.lockSeats(req.params.id, seatNos, req.user.id);
    return apiResponse.success(res, "Seats locked successfully for 10 minutes", result);
});

const updateShow = asyncHandler(async (req, res) => {
    const show = await showService.updateShow(req.params.id, req.body);
    return apiResponse.success(res, "Show updated successfully", show);
});

const deleteShow = asyncHandler(async (req, res) => {
    await showService.deleteShow(req.params.id);
    return apiResponse.success(res, "Show cancelled successfully");
});

module.exports = {
    createShow,
    getShows,
    getShow,
    lockSeats,
    updateShow,
    deleteShow
};
