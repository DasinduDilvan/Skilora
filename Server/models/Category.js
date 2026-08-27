
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate categoryId before saving
categorySchema.pre("save", async function () {
  if (!this.categoryId) {
    const count = await mongoose.model("Category").countDocuments();
    this.categoryId = `CAT${String(count + 1).padStart(5, "0")}`;
  }
});

export default mongoose.model("Category", categorySchema);