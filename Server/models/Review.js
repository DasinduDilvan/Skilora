
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      unique: true,
    },
    projectId: {
      type: String,
      required: true,
      ref: "Project",
    },
    reviewerId: {
      type: String,
      required: true,
    },
    revieweeId: {
      type: String,
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ["client", "freelancer"],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    communicationRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    qualityRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    deadlineRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    wouldRecommend: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate reviewId before saving
reviewSchema.pre("save", async function () {
  if (!this.reviewId) {
    const count = await mongoose.model("Review").countDocuments();
    this.reviewId = `REV${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Review", reviewSchema);