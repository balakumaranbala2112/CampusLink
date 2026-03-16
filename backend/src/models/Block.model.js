import mongoose from "mongoose";

const blockSchema = new mongoose.Schema(
  {
    // who did the blocking
    blocker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who got blocked
    blocked: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
blockSchema.index({ blocker: 1 });
blockSchema.index({ blocked: 1 });

// prevent duplicate blocks
blockSchema.index({ blocker: 1, blocked: 1 }, { unique: true });

export default mongoose.models.Block || mongoose.model("Block", blockSchema);
