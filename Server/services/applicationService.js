
import Application from "../models/Application.js";

// Get all applications
const getAllApplications = async (query = {}) => {
  const filter = {};

  if (query.projectId) filter.projectId = query.projectId;
  if (query.freelancerId) filter.freelancerId = query.freelancerId;
  if (query.status) filter.status = query.status;

  const applications = await Application.find(filter).sort({ createdAt: -1 });
  return applications;
};

// Get application by applicationId
const getApplicationById = async (applicationId) => {
  const application = await Application.findOne({ applicationId });
  if (!application) {
    throw new Error("Application not found");
  }
  return application;
};

// Create application
const createApplication = async (data) => {
  // Check if freelancer already applied for this project
  const existing = await Application.findOne({
    projectId: data.projectId,
    freelancerId: data.freelancerId,
    status: { $ne: "withdrawn" },
  });

  if (existing) {
    throw new Error("You have already applied for this project");
  }

  const application = await Application.create(data);
  return application;
};

// Update application
const updateApplication = async (applicationId, updateData) => {
  // Set respondedAt when status changes
  if (
    updateData.status &&
    (updateData.status === "accepted" || updateData.status === "rejected")
  ) {
    updateData.respondedAt = new Date();
  }

  const application = await Application.findOneAndUpdate(
    { applicationId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!application) {
    throw new Error("Application not found");
  }

  return application;
};

// Delete application
const deleteApplication = async (applicationId) => {
  const application = await Application.findOneAndDelete({ applicationId });
  if (!application) {
    throw new Error("Application not found");
  }
  return application;
};


export default {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};