
import Payment from "../models/Payment.js";

// Get all payments
const getAllPayments = async (query = {}) => {
  const filter = {};

  if (query.projectId) filter.projectId = query.projectId;
  if (query.clientId) filter.clientId = query.clientId;
  if (query.freelancerId) filter.freelancerId = query.freelancerId;
  if (query.status) filter.status = query.status;
  if (query.paymentType) filter.paymentType = query.paymentType;

  const payments = await Payment.find(filter).sort({ createdAt: -1 });
  return payments;
};

// Get payment by paymentId
const getPaymentById = async (paymentId) => {
  const payment = await Payment.findOne({ paymentId });
  if (!payment) {
    throw new Error("Payment not found");
  }
  return payment;
};

// Create payment
const createPayment = async (data) => {
  const payment = await Payment.create(data);
  return payment;
};

// Update payment
const updatePayment = async (paymentId, updateData) => {
  // Set paidAt when status changes to completed
  if (updateData.status === "completed") {
    updateData.paidAt = new Date();
  }

  const payment = await Payment.findOneAndUpdate({ paymentId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

// Delete payment
const deletePayment = async (paymentId) => {
  const payment = await Payment.findOneAndDelete({ paymentId });
  if (!payment) {
    throw new Error("Payment not found");
  }
  return payment;
};



export default {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
};