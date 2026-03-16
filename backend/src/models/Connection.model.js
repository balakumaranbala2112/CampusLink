import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    // who sent the request
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who received the request
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // current state
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes 
connectionSchema.index({ requester: 1 });
connectionSchema.index({ receiver: 1 });
connectionSchema.index({ status: 1 });

// ── Prevent duplicate requests
// A→B can only exist once
connectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });

export default mongoose.models.Connection ||
  mongoose.model("Connection", connectionSchema);
