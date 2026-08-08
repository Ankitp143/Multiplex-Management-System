const asyncHandler = require("../middleware/asyncHandler");
const reportService = require("../services/reportService");
const apiResponse = require("../utils/apiResponse");

const getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await reportService.getDashboardStats(req.user);
    return apiResponse.success(res, "Dashboard analytics retrieved", stats);
});

const getRevenueReport = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    const report = await reportService.getRevenueReport(startDate, endDate, req.user);
    return apiResponse.success(res, "Revenue report generated", report);
});

module.exports = {
    getDashboardStats,
    getRevenueReport
};
