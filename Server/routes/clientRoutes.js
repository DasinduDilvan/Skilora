//make those as import statements like the other controllers
import express from "express";
import clientController from "../controllers/clientController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js"; 
const router = express.Router();
// Public routes
router.get("/", clientController.getAllClients);
router.get("/:clientId", clientController.getClientById);

// Protected routes
router.post("/", auth, clientController.createClient);
router.put("/:clientId", auth, clientController.updateClient);
router.delete(
  "/:clientId",
  auth,
  roleCheck("admin"),
  clientController.deleteClient
);

export default router;