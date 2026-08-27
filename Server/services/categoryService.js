
import Category from "../models/Category.js";

// Get all categories
const getAllCategories = async (query = {}) => {
  const filter = {};

  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
  if (query.search) {
    filter.name = { $regex: query.search, $options: "i" };
  }

  const categories = await Category.find(filter).sort({ displayOrder: 1 });
  return categories;
};

// Get category by categoryId
const getCategoryById = async (categoryId) => {
  const category = await Category.findOne({ categoryId });
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

// Create category
const createCategory = async (data) => {
  const category = await Category.create(data);
  return category;
};

// Update category
const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findOneAndUpdate({ categoryId }, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

// Delete category
const deleteCategory = async (categoryId) => {
  const category = await Category.findOneAndDelete({ categoryId });
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};


export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};