
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },
    reportedBy: {
      type: String,
      required: true,
      ref: "User",
    },
    reportedUserId: {
      type: String,
      default: null,
    },
    reportedProjectId: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
    resolvedBy: {
      type: String,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate reportId before saving
reportSchema.pre("save", async function () {
  if (!this.reportId) {
    const count = await mongoose.model("Report").countDocuments();
    this.reportId = `RPT${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Report", reportSchema);