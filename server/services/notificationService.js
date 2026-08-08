const Notification = require("../models/Notification");

const getUserNotifications = async (userId) => {
    return await Notification.find({ user: userId }).sort("-createdAt");
};

const markNotificationRead = async (notificationId, userId) => {
    return await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
    );
};

const markAllNotificationsRead = async (userId) => {
    await Notification.updateMany({ user: userId }, { isRead: true });
    return true;
};

module.exports = {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead
};
