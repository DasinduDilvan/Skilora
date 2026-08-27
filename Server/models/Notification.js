
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "application",
        "project",
        "payment",
        "review",
        "task",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    projectId: {
      type: String,
      default: null,
    },
    applicationId: {
      type: String,
      default: null,
    },
    paymentId: {
      type: String,
      default: null,
    },
    reviewId: {
      type: String,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Generate notificationId before saving
notificationSchema.pre("save", async function () {
  if (!this.notificationId) {
    const count = await mongoose.model("Notification").countDocuments();
    this.notificationId = `NTF${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Notification", notificationSchema);