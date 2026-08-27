
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    sectionId: { type: String },
    title: { type: String },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    workRange: { type: String },
    budget: { type: Number, default: 0 },
    budgetType: {
      type: String,
      enum: ["fixed", "hourly"],
      default: "fixed",
    },
    deadline: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "requested",
        "accepted",
        "in-progress",
        "completed",
        "rejected",
      ],
      default: "pending",
    },
    progress: { type: Number, default: 0 },
    clientNote: { type: String },
    freelancerNote: { type: String },
    rejectionReason: { type: String },
    requestedAt: { type: Date },
    acceptedAt: { type: Date },
    completedAt: { type: Date },
    sections: [sectionSchema],
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectId: {
      type: String,
      unique: true,
    },
    clientId: {
      type: String,
      required: true,
      ref: "Client",
    },
    freelancerId: {
      type: String,
      default: null,
      ref: "Freelancer",
    },
    categoryId: {
      type: String,
      default: null,
      ref: "Category",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "open",
        "in-progress",
        "completed",
        "cancelled",
        "on-hold",
      ],
      default: "open",
    },
    startDate: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
    },
    tasks: [taskSchema],
  },
  {
    timestamps: true,
  }
);

// Generate projectId and taskIds before saving
projectSchema.pre("save", async function () {
  if (!this.projectId) {
    const count = await mongoose.model("Project").countDocuments();
    this.projectId = `PRJ${String(count + 1).padStart(5, "0")}`;
  }

  if (this.tasks && this.tasks.length > 0) {
    this.tasks.forEach((task, tIndex) => {
      if (!task.taskId) {
        task.taskId = `${this.projectId}-TSK${String(tIndex + 1).padStart(3, "0")}`;
      }
      if (task.sections && task.sections.length > 0) {
        task.sections.forEach((section, sIndex) => {
          if (!section.sectionId) {
            section.sectionId = `${task.taskId}-SEC${String(sIndex + 1).padStart(3, "0")}`;
          }
        });
      }
    });
  }
});

export default mongoose.model("Project", projectSchema);