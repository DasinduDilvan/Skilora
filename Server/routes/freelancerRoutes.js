
//make those as import statements like the other controllers
import express from "express";
import freelancerController from "../controllers/freelancerController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();
// Public routes
router.get("/", freelancerController.getAllFreelancers);
router.get("/:freelancerId", freelancerController.getFreelancerById);

// Protected routes
router.post("/", auth, freelancerController.createFreelancer);
router.put("/:freelancerId", auth, freelancerController.updateFreelancer);
router.delete(
  "/:freelancerId",
  auth,
  roleCheck("admin"),
  freelancerController.deleteFreelancer
);

export default router;