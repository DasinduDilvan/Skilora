//make those as import statements like the other controllers
import express from "express";
import reportController from "../controllers/reportController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();

// Protected routes
router.get("/", auth, roleCheck("admin"), reportController.getAllReports);
router.get("/:reportId", auth, reportController.getReportById);
router.post("/", auth, reportController.createReport);
router.put(
  "/:reportId",
  auth,
  roleCheck("admin"),
  reportController.updateReport
);
router.delete(
  "/:reportId",
  auth,
  roleCheck("admin"),
  reportController.deleteReport
);

export default router;