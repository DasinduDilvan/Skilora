
import Report from "../models/Report.js";

// Get all reports
const getAllReports = async (query = {}) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.reportedBy) filter.reportedBy = query.reportedBy;
  if (query.reportedUserId) filter.reportedUserId = query.reportedUserId;
  if (query.reportedProjectId)
    filter.reportedProjectId = query.reportedProjectId;

  const reports = await Report.find(filter).sort({ createdAt: -1 });
  return reports;
};

// Get report by reportId
const getReportById = async (reportId) => {
  const report = await Report.findOne({ reportId });
  if (!report) {
    throw new Error("Report not found");
  }
  return report;
};

// Create report
const createReport = async (data) => {
  const report = await Report.create(data);
  return report;
};

// Update report
const updateReport = async (reportId, updateData) => {
  // Set resolvedAt when status changes to resolved or rejected
  if (
    updateData.status === "resolved" ||
    updateData.status === "rejected"
  ) {
    updateData.resolvedAt = new Date();
  }

  const report = await Report.findOneAndUpdate({ reportId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!report) {
    throw new Error("Report not found");
  }

  return report;
};

// Delete report
const deleteReport = async (reportId) => {
  const report = await Report.findOneAndDelete({ reportId });
  if (!report) {
    throw new Error("Report not found");
  }
  return report;
};

export default {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};