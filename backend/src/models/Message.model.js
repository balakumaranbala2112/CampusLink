import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // who sent the message
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who received the message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // the actual message text
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    // false = not read yet (show unread badge)
    // true  = receiver opened the chat and saw it
    isRead: {
      type: Boolean,
      default: false,
    },

    // soft delete
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // auto adds createdAt, updatedAt
  },
);

// ---- Indexes ----
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ createdAt: -1 });

// this index makes fetching conversation fast
// "find all messages between user A and user B"
messageSchema.index({ sender: 1, receiver: 1 });

export default mongoose.models.Message ||
  mongoose.model("Message", messageSchema);
