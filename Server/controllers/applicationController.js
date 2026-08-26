
//make those as import statements like the other controllers
import applicationService from "../services/applicationService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { validateApplication } from "../validators/applicationValidator.js";

// GET /api/applications
const getAllApplications = async (req, res, next) => {
  try {
    const applications = await applicationService.getAllApplications(req.query);
    return successResponse(
      res,
      200,
      "Applications fetched successfully",
      applications
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/applications/:applicationId
const getApplicationById = async (req, res, next) => {
  try {
    const application = await applicationService.getApplicationById(
      req.params.applicationId
    );
    return successResponse(
      res,
      200,
      "Application fetched successfully",
      application
    );
  } catch (error) {
    if (error.message === "Application not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/applications
const createApplication = async (req, res, next) => {
  try {
    const errors = validateApplication(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const application = await applicationService.createApplication(req.body);
    return successResponse(
      res,
      201,
      "Application submitted successfully",
      application
    );
  } catch (error) {
    if (error.message === "You have already applied for this project") {
      return errorResponse(res, 400, error.message);
    }
    next(error);
  }
};

// PUT /api/applications/:applicationId
const updateApplication = async (req, res, next) => {
  try {
    const application = await applicationService.updateApplication(
      req.params.applicationId,
      req.body
    );
    return successResponse(
      res,
      200,
      "Application updated successfully",
      application
    );
  } catch (error) {
    if (error.message === "Application not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/applications/:applicationId
const deleteApplication = async (req, res, next) => {
  try {
    await applicationService.deleteApplication(req.params.applicationId);
    return successResponse(res, 200, "Application deleted successfully");
  } catch (error) {
    if (error.message === "Application not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
};  