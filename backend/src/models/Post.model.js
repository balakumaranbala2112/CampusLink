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
    default: Date.no,
  },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Type.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      maxlength: [3000, "Post cannot exceed 3000 characters"],
    },
    type: {
      type: String,
      enum: ["short", "article"],
      default: "short",
    },

    likes: {
      type: [mongoose.Schema.Type.ObjectId],
      ref: "User",
      default: [],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },

    collegeTag: {
      type: mongoose.Schema.Type.ObjectId,
      ref: "College",
      default: null,
    },
    hashtags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 }); // newest first for feed
postSchema.index({ collegeTag: 1 }); // college feed filter
postSchema.index({ hashtags: 1 }); // hashtag search

export default mongoose.model.Post || mongoose.model("Post", postSchema);
