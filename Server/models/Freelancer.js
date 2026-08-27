
import mongoose from "mongoose";

const freelancerSchema = new mongoose.Schema(
  {
    freelancerId: {
      type: String,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    headline: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },
    resumeUrl: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    availability: {
      type: String,
      enum: ["full-time", "part-time", "contract", "not-available"],
      default: "full-time",
    },
    isOpenToWork: {
      type: Boolean,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    hourlyRate: {
      type: Number,
      default: 0,
    },
    jobSuccessRate: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    projectsCompleted: {
      type: Number,
      default: 0,
    },
    responseTime: {
      type: String,
      default: "within 24 hours",
    },
    isTopRated: {
      type: Boolean,
      default: false,
    },
    workingProjectIds: {
      type: [String],
      default: [],
    },
    notificationIds: {
      type: [String],
      default: [],
    },
    dashboardStats: {
      activeProjects: { type: Number, default: 0 },
      completedProjects: { type: Number, default: 0 },
      pendingApplications: { type: Number, default: 0 },
      acceptedApplications: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 },
      unreadNotifications: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      profileViews: { type: Number, default: 0 },
    },
    services: [
      {
        title: { type: String },
        description: { type: String },
        startingPrice: { type: Number },
        serviceType: { type: String },
        deliverables: { type: [String] },
      },
    ],
    portfolio: [
      {
        title: { type: String },
        category: { type: String },
        description: { type: String },
        imageUrl: { type: String },
        results: { type: String },
        technologies: { type: [String] },
        projectUrl: { type: String },
      },
    ],
    experience: [
      {
        company: { type: String },
        position: { type: String },
        employmentType: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
        location: { type: String },
        description: { type: String },
        technologies: { type: [String] },
      },
    ],
    skills: [
      {
        skillId: { type: String },
        endorsementCount: { type: Number, default: 0 },
      },
    ],
    education: [
      {
        institution: { type: String },
        degree: { type: String },
        field: { type: String },
        startYear: { type: Number },
        endYear: { type: Number },
        description: { type: String },
      },
    ],
    certifications: [
      {
        name: { type: String },
        issuer: { type: String },
        issueDate: { type: Date },
        expiryDate: { type: Date },
        credentialUrl: { type: String },
      },
    ],
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Generate freelancerId before saving
freelancerSchema.pre("save", async function () {
  if (!this.freelancerId) {
    const count = await mongoose.model("Freelancer").countDocuments();
    this.freelancerId = `FRL${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Freelancer", freelancerSchema);