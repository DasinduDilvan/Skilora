
//make those as import statements like the other controllers
import paymentService from "../services/paymentService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
// GET /api/payments
const getAllPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getAllPayments(req.query);
    return successResponse(
      res,
      200,
      "Payments fetched successfully",
      payments
    );
  } catch (error) {
    next(error);
  }
};

// GET /api/payments/:paymentId
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.paymentId);
    return successResponse(res, 200, "Payment fetched successfully", payment);
  } catch (error) {
    if (error.message === "Payment not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/payments
const createPayment = async (req, res, next) => {
  try {
    if (!req.body.projectId || !req.body.clientId || !req.body.freelancerId || !req.body.amount) {
      return errorResponse(
        res,
        400,
        "projectId, clientId, freelancerId, and amount are required"
      );
    }

    const payment = await paymentService.createPayment(req.body);
    return successResponse(res, 201, "Payment created successfully", payment);
  } catch (error) {
    next(error);
  }
};

// PUT /api/payments/:paymentId
const updatePayment = async (req, res, next) => {
  try {
    const payment = await paymentService.updatePayment(
      req.params.paymentId,
      req.body
    );
    return successResponse(res, 200, "Payment updated successfully", payment);
  } catch (error) {
    if (error.message === "Payment not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/payments/:paymentId
const deletePayment = async (req, res, next) => {
  try {
    await paymentService.deletePayment(req.params.paymentId);
    return successResponse(res, 200, "Payment deleted successfully");
  } catch (error) {
    if (error.message === "Payment not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

export default {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
  };