
import Freelancer from "../models/Freelancer.js";

// Get all freelancers
const getAllFreelancers = async (query = {}) => {
  const filter = {};

  if (query.isAvailable !== undefined)
    filter.isAvailable = query.isAvailable === "true";
  if (query.isOpenToWork !== undefined)
    filter.isOpenToWork = query.isOpenToWork === "true";
  if (query.isTopRated !== undefined)
    filter.isTopRated = query.isTopRated === "true";
  if (query.availability) filter.availability = query.availability;
  if (query.search) {
    filter.$or = [
      { headline: { $regex: query.search, $options: "i" } },
      { bio: { $regex: query.search, $options: "i" } },
      { location: { $regex: query.search, $options: "i" } },
    ];
  }
  if (query.minRate) filter.hourlyRate = { $gte: Number(query.minRate) };
  if (query.maxRate) {
    filter.hourlyRate = {
      ...filter.hourlyRate,
      $lte: Number(query.maxRate),
    };
  }

  const freelancers = await Freelancer.find(filter).sort({ createdAt: -1 });
  return freelancers;
};

// Get freelancer by freelancerId
const getFreelancerById = async (freelancerId) => {
  const freelancer = await Freelancer.findOne({ freelancerId });
  if (!freelancer) {
    throw new Error("Freelancer not found");
  }
  return freelancer;
};

// Create freelancer
const createFreelancer = async (data) => {
  const freelancer = await Freelancer.create(data);
  return freelancer;
};

// Update freelancer
const updateFreelancer = async (freelancerId, updateData) => {
  const freelancer = await Freelancer.findOneAndUpdate(
    { freelancerId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!freelancer) {
    throw new Error("Freelancer not found");
  }

  return freelancer;
};

// Delete freelancer
const deleteFreelancer = async (freelancerId) => {
  const freelancer = await Freelancer.findOneAndDelete({ freelancerId });
  if (!freelancer) {
    throw new Error("Freelancer not found");
  }
  return freelancer;
};


export default {
  getAllFreelancers,
  getFreelancerById,
  createFreelancer,
  updateFreelancer,
  deleteFreelancer,
};