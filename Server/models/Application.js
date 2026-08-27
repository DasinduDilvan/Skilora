
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
    },
    projectId: {
      type: String,
      required: true,
      ref: "Project",
    },
    freelancerId: {
      type: String,
      required: true,
      ref: "Freelancer",
    },
    coverLetter: {
      type: String,
      required: true,
    },
    proposedBudget: {
      type: Number,
      required: true,
    },
    budgetType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed",
    },
    estimatedDuration: {
      type: Number,
      required: true,
    },
    durationUnit: {
      type: String,
      enum: ["hours", "days", "weeks", "months"],
      default: "days",
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
    clientMessage: {
      type: String,
      default: "",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate applicationId before saving
applicationSchema.pre("save", async function () {
  if (!this.applicationId) {
    const count = await mongoose.model("Application").countDocuments();
    this.applicationId = `APP${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Application", applicationSchema);