const asyncHandler = require("../middleware/asyncHandler");
const theatreService = require("../services/theatreService");
const apiResponse = require("../utils/apiResponse");

const createTheatre = asyncHandler(async (req, res) => {
    const theatre = await theatreService.createTheatre(req.body, req.user.id);
    return apiResponse.success(res, "Theatre created successfully", theatre, 201);
});

const getTheatres = asyncHandler(async (req, res) => {
    const theatres = await theatreService.getAllTheatres(req.query);
    return apiResponse.success(res, "Theatres retrieved successfully", theatres);
});

const getTheatre = asyncHandler(async (req, res) => {
    const theatre = await theatreService.getTheatreById(req.params.id);
    return apiResponse.success(res, "Theatre retrieved successfully", theatre);
});

const updateTheatre = asyncHandler(async (req, res) => {
    const theatre = await theatreService.updateTheatre(req.params.id, req.body, req.user);
    return apiResponse.success(res, "Theatre updated successfully", theatre);
});

const deleteTheatre = asyncHandler(async (req, res) => {
    await theatreService.deleteTheatre(req.params.id, req.user);
    return apiResponse.success(res, "Theatre deleted successfully");
});

module.exports = {
    createTheatre,
    getTheatres,
    getTheatre,
    updateTheatre,
    deleteTheatre
};
