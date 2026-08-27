
import Project from "../models/Project.js";

// Get all projects
const getAllProjects = async (query = {}) => {
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.clientId) filter.clientId = query.clientId;
  if (query.freelancerId) filter.freelancerId = query.freelancerId;
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.minBudget) filter.budget = { $gte: Number(query.minBudget) };
  if (query.maxBudget) {
    filter.budget = { ...filter.budget, $lte: Number(query.maxBudget) };
  }

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  return projects;
};

// Get project by projectId
const getProjectById = async (projectId) => {
  const project = await Project.findOne({ projectId });
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};

// Create project
const createProject = async (data) => {
  const project = await Project.create(data);
  return project;
};

// Update project
const updateProject = async (projectId, updateData) => {
  const project = await Project.findOneAndUpdate({ projectId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

// Delete project
const deleteProject = async (projectId) => {
  const project = await Project.findOneAndDelete({ projectId });
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
};


export default {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};