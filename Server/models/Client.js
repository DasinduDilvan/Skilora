
import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    clientId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    companyName: {
      type: String,
      default: "",
    },
    companyLogo: {
      type: String,
      default: "",
    },
    companyDescription: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    website: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    companySize: {
      type: String,
      default: "",
    },
    jobTitle: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    preferredFreelancerType: {
      type: String,
      default: "",
    },
    preferredBudgetMin: {
      type: Number,
      default: 0,
    },
    preferredBudgetMax: {
      type: Number,
      default: 0,
    },
    preferredProjectType: {
      type: String,
      default: "",
    },
    totalProjectsPosted: {
      type: Number,
      default: 0,
    },
    totalProjectsCompleted: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    averageRatingGiven: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isCompanyVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate clientId before saving
clientSchema.pre("save", async function () {
  if (!this.clientId) {
    const count = await mongoose.model("Client").countDocuments();
    this.clientId = `CLT${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Client", clientSchema);