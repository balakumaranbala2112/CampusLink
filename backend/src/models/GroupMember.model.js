import mongoose from "mongoose";

const groupMemberSchema = new mongoose.Schema(
  {
    // which group
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },

    // which user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // admin = can manage group
    // member = regular member
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    },

    // active  = approved member
    // pending = waiting for admin approval (private groups)
    status: {
      type: String,
      enum: ["active", "pending"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

// indexes
groupMemberSchema.index({ group: 1 });
groupMemberSchema.index({ user: 1 });

// prevent duplicate membership
// same user cannot join same group twice
groupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

export default mongoose.models.GroupMember ||
  mongoose.model("GroupMember", groupMemberSchema);
