import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
      unique: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ── Index for faster search ──────────────────
collegeSchema.index({ city: 1 });
collegeSchema.index({ state: 1 });

// ✅ Fix — check if model exists before creating
export default mongoose.models.College ||
  mongoose.model("College", collegeSchema);
