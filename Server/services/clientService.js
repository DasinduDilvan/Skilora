
import Client from "../models/Client.js";

// Get all clients
const getAllClients = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
  if (query.isVerified !== undefined)
    filter.isVerified = query.isVerified === "true";
  if (query.industry) filter.industry = query.industry;
  if (query.search) {
    filter.$or = [
      { companyName: { $regex: query.search, $options: "i" } },
      { bio: { $regex: query.search, $options: "i" } },
      { location: { $regex: query.search, $options: "i" } },
    ];
  }

  const clients = await Client.find(filter).sort({ createdAt: -1 });
  return clients;
};

// Get client by clientId
const getClientById = async (clientId) => {
  const client = await Client.findOne({ clientId });
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};

// Create client
const createClient = async (data) => {
  const client = await Client.create(data);
  return client;
};

// Update client
const updateClient = async (clientId, updateData) => {
  const client = await Client.findOneAndUpdate({ clientId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
};

// Delete client
const deleteClient = async (clientId) => {
  const client = await Client.findOneAndDelete({ clientId });
  if (!client) {
    throw new Error("Client not found");
  }
  return client;
};


export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};