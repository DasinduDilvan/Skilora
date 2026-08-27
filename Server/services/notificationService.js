
import Notification from "../models/Notification.js";

// Get all notifications
const getAllNotifications = async (query = {}) => {
  const filter = {};

  if (query.userId) filter.userId = query.userId;
  if (query.type) filter.type = query.type;
  if (query.isRead !== undefined) filter.isRead = query.isRead === "true";

  const notifications = await Notification.find(filter).sort({
    createdAt: -1,
  });
  return notifications;
};

// Get notification by notificationId
const getNotificationById = async (notificationId) => {
  const notification = await Notification.findOne({ notificationId });
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};

// Create notification
const createNotification = async (data) => {
  const notification = await Notification.create(data);
  return notification;
};

// Update notification (mark as read, etc.)
const updateNotification = async (notificationId, updateData) => {
  const notification = await Notification.findOneAndUpdate(
    { notificationId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!notification) {
    throw new Error("Notification not found");
  }

  return notification;
};

// Delete notification
const deleteNotification = async (notificationId) => {
  const notification = await Notification.findOneAndDelete({ notificationId });
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};


export default {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};