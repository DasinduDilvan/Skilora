//make those as import statements like the other controllers
import express from "express";
import categoryController from "../controllers/categoryController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:categoryId", categoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  auth,
  roleCheck("admin"),
  categoryController.createCategory
);
router.put(
  "/:categoryId",
  auth,
  roleCheck("admin"),
  categoryController.updateCategory
);
router.delete(
  "/:categoryId",
  auth,
  roleCheck("admin"),
  categoryController.deleteCategory
);

export default router;