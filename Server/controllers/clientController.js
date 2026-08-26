
import clientService from "../services/clientService.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// GET /api/clients
const getAllClients = async (req, res, next) => {
  try {
    const clients = await clientService.getAllClients(req.query);
    return successResponse(res, 200, "Clients fetched successfully", clients);
  } catch (error) {
    next(error);
  }
};

// GET /api/clients/:clientId
const getClientById = async (req, res, next) => {
  try {
    const client = await clientService.getClientById(req.params.clientId);
    return successResponse(res, 200, "Client fetched successfully", client);
  } catch (error) {
    if (error.message === "Client not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// POST /api/clients
const createClient = async (req, res, next) => {
  try {
    const client = await clientService.createClient(req.body);
    return successResponse(res, 201, "Client created successfully", client);
  } catch (error) {
    next(error);
  }
};

// PUT /api/clients/:clientId
const updateClient = async (req, res, next) => {
  try {
    const client = await clientService.updateClient(
      req.params.clientId,
      req.body
    );
    return successResponse(res, 200, "Client updated successfully", client);
  } catch (error) {
    if (error.message === "Client not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};

// DELETE /api/clients/:clientId
const deleteClient = async (req, res, next) => {
  try {
    await clientService.deleteClient(req.params.clientId);
    return successResponse(res, 200, "Client deleted successfully");
  } catch (error) {
    if (error.message === "Client not found") {
      return errorResponse(res, 404, error.message);
    }
    next(error);
  }
};


export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};