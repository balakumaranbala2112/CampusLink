import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      index: false, // ← ADD THIS LINE
      trim: true,
      minlength: [10, "Phone must be 10 digits"],
      maxlength: [10, "Phone must be 10 digits"],
    },

    // ── College Info ──────────────────────────
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College", // links to College model
      default: null,
    },
    department: {
      type: String,
      trim: true,
      default: null,
      // examples: "Computer Science", "Mechanical", "Commerce"
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
      // 1 = first year, 2 = second year etc
    },

    // ── Profile Info ──────────────────────────
    name: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    bio: {
      type: String,
      trim: true,
      default: null,
      maxlength: [280, "Bio cannot exceed 280 characters"],
    },
    profilePhoto: {
      type: String, // stores Cloudinary URL
      default: null,
    },

    // ── Skills & Interests ────────────────────
    skills: {
      type: [String], // array of strings ["React", "Python"]
      default: [],
    },

    // ── Account Status ────────────────────────
    isVerified: {
      type: Boolean,
      default: false, // becomes true after profile is complete
    },
    isActive: {
      type: Boolean,
      default: true, // false = banned/deleted account
    },

    // ── Privacy Settings ──────────────────────
    visibility: {
      type: String,
      enum: ["public", "connections"], // only these two values allowed
      default: "public",
    },

    // ── Profile Completeness ──────────────────
    completenessScore: {
      type: Number,
      default: 0, // 0 to 100
    },
  },
  {
    timestamps: true, // auto adds createdAt and updatedAt
  },
);

// ── Indexes for faster search ─────────────────
userSchema.index({ college: 1 });
userSchema.index({ department: 1 });
userSchema.index({ skills: 1 });

// ── Profile Completeness Score Method ─────────
// called on any user object to calculate score
userSchema.methods.calculateCompleteness = function () {
  let score = 0;

  if (this.name) score += 20; // 20 points for name
  if (this.bio) score += 20; // 20 points for bio
  if (this.college) score += 20; // 20 points for college
  if (this.department) score += 15; // 15 points for department
  if (this.year) score += 10; // 10 points for year
  if (this.skills.length > 0) score += 15; // 15 points for skills

  // total = 100 when all filled

  this.completenessScore = score;
  return score;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
