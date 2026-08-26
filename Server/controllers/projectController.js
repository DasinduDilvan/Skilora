
//make those as import statements like the other controllers
import projectService from "../services/projectService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { validateProject } from "../validators/projectValidator.js";   


// GET /api/projects
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects(req.query);
    return successResponse(
      res,
      200,
      "Projects fetched successfully",
      projects
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/projects/:projectId
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    return successResponse(res, 200, "Project fetched successfully", project);
  } catch (error) {
    if (error.message === "Project not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const errors = validateProject(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const project = await projectService.createProject(req.body);
    return successResponse(res, 201, "Project created successfully", project);
  } catch (error) {
    next(error);
  }
};

// PUT /api/projects/:projectId
const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.projectId,
      req.body
    );
    return successResponse(res, 200, "Project updated successfully", project);
  } catch (error) {
    if (error.message === "Project not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/projects/:projectId
const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.projectId);
    return successResponse(res, 200, "Project deleted successfully");
  } catch (error) {
    if (error.message === "Project not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};