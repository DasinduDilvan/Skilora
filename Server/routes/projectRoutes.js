//make those as import statements like the other controllers
import express from "express";
import projectController from "../controllers/projectController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();
// Public routes
router.get("/", projectController.getAllProjects);
router.get("/:projectId", projectController.getProjectById);

// Protected routes
router.post(
  "/",
  auth,
  roleCheck("client", "admin"),
  projectController.createProject
);
router.put("/:projectId", auth, projectController.updateProject);
router.delete(
  "/:projectId",
  auth,
  roleCheck("client", "admin"),
  projectController.deleteProject
);

export default router;