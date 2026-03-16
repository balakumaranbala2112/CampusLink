import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // who triggered this notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // what type of notification
    type: {
      type: String,
      enum: [
        "connection_request",
        "connection_accept",
        "post_like",
        "post_comment",
      ],
      required: true,
    },

    // human readable message
    message: {
      type: String,
      required: true,
    },

    // link to the relevant content
    // connection request → /connections
    // post like         → /posts/POST_ID
    link: {
      type: String,
      default: null,
    },

    // has the recipient read this?
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// indexes
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export default mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);
