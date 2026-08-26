//make those as import statements like the other controllers.js
import userService from "../services/userService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import {
  validateSignUp,
  validateSignIn,
  validateUpdateUser,
} from "../validators/userValidator.js";

// POST /api/users/signup
const signUp = async (req, res) => {
  try {
    const errors = validateSignUp(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const result = await userService.signUpUser(req.body);
    return successResponse(res, 201, "User registered successfully", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// POST /api/users/signin
const signIn = async (req, res) => {
  try {
    const errors = validateSignIn(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const result = await userService.signInUser(req.body.email, req.body.password);
    return successResponse(res, 200, "Login successful", result);
  } catch (error) {
    return errorResponse(res, 401, error.message);
  }
};

// GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers(req.query);
    return successResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// GET /api/users/:userId
const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.userId);
    return successResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return errorResponse(res, statusCode, error.message);
  }
};

// POST /api/users (Admin create user)
const createUser = async (req, res) => {
  try {
    const errors = validateSignUp(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const result = await userService.signUpUser(req.body);
    return successResponse(res, 201, "User created successfully", result);
  } catch (error) {
    return errorResponse(res, 400, error.message);
  }
};

// PUT /api/users/:userId
const updateUser = async (req, res) => {
  try {
    const errors = validateUpdateUser(req.body);
    if (errors.length > 0) {
      return errorResponse(res, 400, errors.join(", "));
    }

    const user = await userService.updateUser(req.params.userId, req.body);
    return successResponse(res, 200, "User updated successfully", user);
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return errorResponse(res, statusCode, error.message);
  }
};

// DELETE /api/users/:userId
const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.userId);
    return successResponse(res, 200, "User deleted successfully");
  } catch (error) {
    const statusCode = error.message === "User not found" ? 404 : 500;
    return errorResponse(res, statusCode, error.message);
  }
};

// GET /api/users/me
const getMe = async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.userId);
    return successResponse(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};


export default {
  signUp,
  signIn,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getMe,
};