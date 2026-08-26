//make those as import statements like the other controllers
import reviewService from "../services/reviewService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/reviews
const getAllReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getAllReviews(req.query);
    return successResponse(res, 200, "Reviews fetched successfully", reviews);
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/:reviewId
const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.reviewId);
    return successResponse(res, 200, "Review fetched successfully", review);
  } catch (error) {
    if (error.message === "Review not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/reviews
const createReview = async (req, res, next) => {
  try {
    if (
      !req.body.projectId ||
      !req.body.reviewerId ||
      !req.body.revieweeId ||
      !req.body.reviewerRole ||
      !req.body.rating
    ) {
      return errorResponse(
        res,
        400,
        "projectId, reviewerId, revieweeId, reviewerRole, and rating are required"
      );
    }

    const review = await reviewService.createReview(req.body);
    return successResponse(res, 201, "Review created successfully", review);
  } catch (error) {
    if (error.message === "You have already reviewed this project") {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

// PUT /api/reviews/:reviewId
const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.params.reviewId,
      req.body
    );
    return successResponse(res, 200, "Review updated successfully", review);
  } catch (error) {
    if (error.message === "Review not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/reviews/:reviewId
const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.reviewId);
    return successResponse(res, 200, "Review deleted successfully");
  } catch (error) {
    if (error.message === "Review not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};