//make those as import statements like the other controllers
import express from "express";
import paymentController from "../controllers/paymentController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();

// Protected routes
router.get("/", auth, paymentController.getAllPayments);
router.get("/:paymentId", auth, paymentController.getPaymentById);
router.post(
  "/",
  auth,
  roleCheck("client", "admin"),
  paymentController.createPayment
);
router.put("/:paymentId", auth, paymentController.updatePayment);
router.delete(
  "/:paymentId",
  auth,
  roleCheck("admin"),
  paymentController.deletePayment
);

export default router;