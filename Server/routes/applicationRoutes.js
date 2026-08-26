//make those as import statements like the other controllers
import express from "express";
import applicationController from "../controllers/applicationController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();

// Protected routes (all require authentication)
router.get("/", auth, applicationController.getAllApplications);
router.get(
  "/:applicationId",
  auth,
  applicationController.getApplicationById
);
router.post(
  "/",
  auth,
  roleCheck("freelancer"),
  applicationController.createApplication
);
router.put("/:applicationId", auth, applicationController.updateApplication);
router.delete(
  "/:applicationId",
  auth,
  applicationController.deleteApplication
);

export default router;