//make those as import statements like the other controllers
import express from "express";
import notificationController from "../controllers/notificationController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// Protected routes (all require authentication)
router.get("/", auth, notificationController.getAllNotifications);
router.get(
  "/:notificationId",
  auth,
  notificationController.getNotificationById
);
router.post("/", auth, notificationController.createNotification);
router.put(
  "/:notificationId",
  auth,
  notificationController.updateNotification
);
router.delete(
  "/:notificationId",
  auth,
  notificationController.deleteNotification
);

export default router;