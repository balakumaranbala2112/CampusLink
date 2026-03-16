import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    // who made the report
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // what type of content is being reported
    targetType: {
      type: String,
      enum: ["user", "post", "message"],
      required: true,
    },

    // the ID of the reported content
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType", // dynamic reference based on targetType
    },

    // why they are reporting
    reason: {
      type: String,
      enum: [
        "spam",
        "harassment",
        "hate_speech",
        "inappropriate_content",
        "fake_account",
        "other",
      ],
      required: true,
    },

    // additional details
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: null,
    },

    // admin review status
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved", "dismissed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// indexes
reportSchema.index({ reporter: 1 });
reportSchema.index({ targetId: 1 });
reportSchema.index({ status: 1 });

// prevent same user reporting same content twice
reportSchema.index({ reporter: 1, targetId: 1 }, { unique: true });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);
