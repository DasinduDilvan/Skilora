//make those as import statements like the other controllers
import notificationService from "../services/notificationService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/notifications
const getAllNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getAllNotifications(
      req.query
    );
    return successResponse(
      res,
      200,
      "Notifications fetched successfully",
      notifications
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/:notificationId
const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.notificationId
    );
    return successResponse(
      res,
      200,
      "Notification fetched successfully",
      notification
    );
  } catch (error) {
    if (error.message === "Notification not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/notifications
const createNotification = async (req, res, next) => {
  try {
    if (!req.body.userId || !req.body.type || !req.body.title || !req.body.message) {
      return errorResponse(
        res,
        400,
        "userId, type, title, and message are required"
      );
    }

    const notification = await notificationService.createNotification(
      req.body
    );
    return successResponse(
      res,
      201,
      "Notification created successfully",
      notification
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:notificationId
const updateNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.updateNotification(
      req.params.notificationId,
      req.body
    );
    return successResponse(
      res,
      200,
      "Notification updated successfully",
      notification
    );
  } catch (error) {
    if (error.message === "Notification not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/notifications/:notificationId
const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.notificationId);
    return successResponse(res, 200, "Notification deleted successfully");
  } catch (error) {
    if (error.message === "Notification not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};


export default {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
};