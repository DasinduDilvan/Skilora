//make those as import statements like the other controllers
import reportService from "../services/reportService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/reports
const getAllReports = async (req, res, next) => {
  try {
    const reports = await reportService.getAllReports(req.query);
    return successResponse(res, 200, "Reports fetched successfully", reports);
  } catch (error) {
    next(error);
  }
};

// GET /api/reports/:reportId
const getReportById = async (req, res, next) => {
  try {
    const report = await reportService.getReportById(req.params.reportId);
    return successResponse(res, 200, "Report fetched successfully", report);
  } catch (error) {
    if (error.message === "Report not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    if (!req.body.reportedBy || !req.body.reason) {
      return errorResponse(res, 400, "reportedBy and reason are required");
    }

    const report = await reportService.createReport(req.body);
    return successResponse(res, 201, "Report submitted successfully", report);
  } catch (error) {
    next(error);
  }
};

// PUT /api/reports/:reportId
const updateReport = async (req, res, next) => {
  try {
    const report = await reportService.updateReport(
      req.params.reportId,
      req.body
    );
    return successResponse(res, 200, "Report updated successfully", report);
  } catch (error) {
    if (error.message === "Report not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/reports/:reportId
const deleteReport = async (req, res, next) => {
  try {
    await reportService.deleteReport(req.params.reportId);
    return successResponse(res, 200, "Report deleted successfully");
  } catch (error) {
    if (error.message === "Report not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};


export default {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
};