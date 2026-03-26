import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, "Comment cannot exceed 500 characters"],
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// # Post Schema
const postSchema = new mongoose.Schema(
  {
    // who created this post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // the actual text content
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [3000, "Post cannot exceed 3000 characters"],
    },

    // short = tweet style (max 280)
    // article = blog style (max 3000)
    type: {
      type: String,
      enum: ["short", "article"],
      default: "short",
    },

    // optional image — Cloudinary URL
    mediaUrl: {
      type: String,
      default: null,
    },

    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    // array of comment objects stored inside post
    comments: {
      type: [commentSchema],
      default: [],
    },

    // which college this post is tagged to
    // used in feed to show college-specific posts
    collegeTag: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "College",
      default: null,
    },

    // hashtags like ["React", "Placement", "OpenSource"]
    hashTags: {
      type: [String],
      default: [],
    },

    // soft delete — false means post is deleted
    // we never actually remove from DB (audit trail)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// ── Indexes
postSchema.index({ createdAt: -1 });
postSchema.index({ collegeTag: 1 });
postSchema.index({ hashtags: 1 });

export default mongoose.models.Post || mongoose.model("Post", postSchema);
