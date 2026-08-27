
import Review from "../models/Review.js";

// Get all reviews
const getAllReviews = async (query = {}) => {
  const filter = {};

  if (query.projectId) filter.projectId = query.projectId;
  if (query.reviewerId) filter.reviewerId = query.reviewerId;
  if (query.revieweeId) filter.revieweeId = query.revieweeId;
  if (query.reviewerRole) filter.reviewerRole = query.reviewerRole;
  if (query.minRating) filter.rating = { $gte: Number(query.minRating) };

  const reviews = await Review.find(filter).sort({ createdAt: -1 });
  return reviews;
};

// Get review by reviewId
const getReviewById = async (reviewId) => {
  const review = await Review.findOne({ reviewId });
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};

// Create review
const createReview = async (data) => {
  // Check if review already exists for this project by this reviewer
  const existing = await Review.findOne({
    projectId: data.projectId,
    reviewerId: data.reviewerId,
  });

  if (existing) {
    throw new Error("You have already reviewed this project");
  }

  const review = await Review.create(data);
  return review;
};

// Update review
const updateReview = async (reviewId, updateData) => {
  const review = await Review.findOneAndUpdate({ reviewId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

// Delete review
const deleteReview = async (reviewId) => {
  const review = await Review.findOneAndDelete({ reviewId });
  if (!review) {
    throw new Error("Review not found");
  }
  return review;
};


export default {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
};