import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      required: true,
      validate: {
        validator: (arr) => arr.length === 2,
        message: "Participants must contain exactly 2 users",
      },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "blocked"],
      default: "pending",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// 🔥 INDEXES
connectionSchema.index({ participants: 1 }, { unique: true });
connectionSchema.index({ participants: 1, status: 1 });
connectionSchema.index({ receiver: 1, status: 1 });
connectionSchema.index({ requester: 1, status: 1 });

// 🔥 PRE-HOOK
connectionSchema.pre("validate", function (next) {
  if (this.requester.equals(this.receiver)) {
    return next(new Error("Cannot connect with yourself"));
  }

  const sorted = [this.requester.toString(), this.receiver.toString()].sort();

  this.participants = sorted;

  next();
});

export default mongoose.models.Connection ||
  mongoose.model("Connection", connectionSchema);
