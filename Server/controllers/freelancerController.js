
import freelancerService from "../services/freelancerService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/freelancers
const getAllFreelancers = async (req, res, next) => {
  try {
    const freelancers = await freelancerService.getAllFreelancers(req.query);
    return successResponse(
      res,
      200,
      "Freelancers fetched successfully",
      freelancers
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/freelancers/:freelancerId
const getFreelancerById = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.getFreelancerById(
      req.params.freelancerId
    );
    return successResponse(
      res,
      200,
      "Freelancer fetched successfully",
      freelancer
    );
  } catch (error) {
    if (error.message === "Freelancer not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/freelancers
const createFreelancer = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.createFreelancer(req.body);
    return successResponse(
      res,
      201,
      "Freelancer created successfully",
      freelancer
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/freelancers/:freelancerId
const updateFreelancer = async (req, res, next) => {
  try {
    const freelancer = await freelancerService.updateFreelancer(
      req.params.freelancerId,
      req.body
    );
    return successResponse(
      res,
      200,
      "Freelancer updated successfully",
      freelancer
    );
  } catch (error) {
    if (error.message === "Freelancer not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/freelancers/:freelancerId
const deleteFreelancer = async (req, res, next) => {
  try {
    await freelancerService.deleteFreelancer(req.params.freelancerId);
    return successResponse(res, 200, "Freelancer deleted successfully");
  } catch (error) {
    if (error.message === "Freelancer not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
};