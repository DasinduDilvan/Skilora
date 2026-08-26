
//make those as import statements if you are using ES6 modules
import categoryService from "../services/categoryService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/categories
const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories(req.query);
    return successResponse(
      res,
      200,
      "Categories fetched successfully",
      categories
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:categoryId
const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(
      req.params.categoryId
    );
    return successResponse(
      res,
      200,
      "Category fetched successfully",
      category
    );
  } catch (error) {
    if (error.message === "Category not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/categories
const createCategory = async (req, res, next) => {
  try {
    if (!req.body.name || req.body.name.trim() === "") {
      return errorResponse(res, 400, "Category name is required");
    }

    const category = await categoryService.createCategory(req.body);
    return successResponse(
      res,
      201,
      "Category created successfully",
      category
    );
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:categoryId
const updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.categoryId,
      req.body
    );
    return successResponse(
      res,
      200,
      "Category updated successfully",
      category
    );
  } catch (error) {
    if (error.message === "Category not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/categories/:categoryId
const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.categoryId);
    return successResponse(res, 200, "Category deleted successfully");
  } catch (error) {
    if (error.message === "Category not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};