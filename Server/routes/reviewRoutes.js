//make those as import statements like the other controllers
import express from "express";
import reviewController from "../controllers/reviewController.js";
import auth from "../middleware/auth.js";
const router = express.Router();

// Public routes
router.get("/", reviewController.getAllReviews);
router.get("/:reviewId", reviewController.getReviewById);

// Protected routes
router.post("/", auth, reviewController.createReview);
router.put("/:reviewId", auth, reviewController.updateReview);
router.delete("/:reviewId", auth, reviewController.deleteReview);

export default router;