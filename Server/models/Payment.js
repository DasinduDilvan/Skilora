
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
    },
    projectId: {
      type: String,
      required: true,
      ref: "Project",
    },
    clientId: {
      type: String,
      required: true,
      ref: "Client",
    },
    freelancerId: {
      type: String,
      required: true,
      ref: "Freelancer",
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "LKR",
    },
    paymentMethod: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentType: {
      type: String,
      enum: ["milestone", "full", "task", "bonus"],
      default: "full",
    },
    description: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Generate paymentId before saving
paymentSchema.pre("save", async function () {
  if (!this.paymentId) {
    const count = await mongoose.model("Payment").countDocuments();
    this.paymentId = `PAY${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Payment", paymentSchema);