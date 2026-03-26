import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ── Identity
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      index: false,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    // ── College Info
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
      default: null,
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
      type: String,
      default: null,
    },

    // ── Skills & Interests ────────────────────
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: "Skills cannot exceed 20 items",
      },
    },

    // ── Account Status ────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ── Privacy Settings ──────────────────────
    visibility: {
      type: String,
      enum: ["public", "connections", "private"],
      default: "public",
    },

    // ── Profile Completeness ──────────────────
    completenessScore: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes for faster search ─────────────────
userSchema.index({ college: 1 });
userSchema.index({ department: 1 });
userSchema.index({ skills: 1 });

/* # PRE-SAVE HOOK (IMPORTANT) */

userSchema.pre("save", function (next) {
  if (this.skills && this.skills > 0) {
    this.skills = [...Set(this.skills.map((s) => s.trim()))];
  }

  if (this.name) {
    this.name = this.name.trim();
  }

  this.calculateCompleteness();
  next();
});

/* # INSTANCE METHOD */

// ── Profile Completeness Score Method ─────────
userSchema.methods.calculateCompleteness = function () {
  let score = 0;

  if (this.name) score += 20;
  if (this.bio) score += 20;
  if (this.college) score += 20;
  if (this.department) score += 15;
  if (this.year) score += 10;
  if (this.skills.length > 0) score += 15;

  this.completenessScore = score;
  return score;
};

/* # SAFE JSON OUTPUT (VERY IMPORTANT) */

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.__v; // remove internal field
  delete obj.isActive; // hide internal flags

  return obj;
};

export default mongoose.models.User || mongoose.model("User", userSchema);
