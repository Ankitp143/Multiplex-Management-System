const asyncHandler = require("../middleware/asyncHandler");
const notificationService = require("../services/notificationService");
const apiResponse = require("../utils/apiResponse");

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    return apiResponse.success(res, "Notifications retrieved", notifications);
});

const markRead = asyncHandler(async (req, res) => {
    const notification = await notificationService.markNotificationRead(req.params.id, req.user.id);
    return apiResponse.success(res, "Notification marked as read", notification);
});

const markAllRead = asyncHandler(async (req, res) => {
    await notificationService.markAllNotificationsRead(req.user.id);
    return apiResponse.success(res, "All notifications marked as read");
});

module.exports = {
    getNotifications,
    markRead,
    markAllRead
};
