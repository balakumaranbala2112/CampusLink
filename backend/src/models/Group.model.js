import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    // group name
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },

    // group description
    description: {
      type: String,
      trim: true,
      default: null,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    // who created the group
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // public  = anyone can join
    // private = admin must approve
    type: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    // group cover image
    coverImage: {
      type: String,
      default: null,
    },

    // total member count
    // we keep this as a number for quick display
    // instead of counting GroupMember documents every time
    memberCount: {
      type: Number,
      default: 1, // creator is first member
    },

    // is group active?
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// indexes for search
groupSchema.index({ name: 1 });
groupSchema.index({ type: 1 });
groupSchema.index({ creator: 1 });

export default mongoose.models.Group || mongoose.model("Group", groupSchema);
