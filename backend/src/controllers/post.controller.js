import Post from "../models/Post.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ---- POST /api/v1/posts ----
export const createPost = async (req, res) => {
  try {
    const { content, type, collegeTag, hashTags } = req.body;

    if (!content || !content.trim().length === 0) {
      return errorResponse(res, 400, "Post content is required");
    }

    if (type === "short" && content.length > 280) {
      return errorResponse(
        res,
        400,
        "Short posts cannot exceed 280 characters",
      );
    }

    const post = await Post.create({
      author: req.userId,
      content: content.trim(),
      type: type || "short",
      collegeTag: collegeTag || null,
      hashTags: hashTags || [],
    });

    await post.populate("author", "name profilePhoto college");
    return successResponse(res, 201, post, "Post created successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- DELETE /api/v1/posts/:id ----
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return errorResponse(res, 404, "Post not found");
    }

    if (post.author.toString() !== req.userId) {
      return errorResponse(res, 403, "Not authorized to delete this post");
    }

    post.isActive = false;
    await post.save();

    return successResponse(res, 200, null, "Post deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- POST /api/v1/posts/:id/like ----
export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return errorResponse(res, 404, "Post not found");
    }

    const alreadyLiked = post.likes
      .map((id) => id.toString())
      .includes(req.userId);

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.userId);
    } else {
      post.likes.push(req.userId);
    }
    await post.save();

    return successResponse(
      res,
      200,
      {
        liked: !alreadyLiked, // true if just liked, false if unliked
        likesCount: post.likes.length, // total likes now
      },
      alreadyLiked ? "Post unliked" : "Post liked",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- POST /api/v1/posts/:id/comment ----
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return errorResponse(res, 400, "Comment text is required");
    }

    const post = await Post.findById(req.params.id);

    if (!post || !post.isActive) {
      return errorResponse(res, 404, "Post not found");
    }

    post.comment.push({
      user: req.userId,
      text: text.trim(),
      createdAt: new Date(),
    });

    await post.save();

    await post.populate("comments.user", "name profilePhoto");

    const newComment = post.comments[post.comments.length - 1];
    return successResponse(res, 201, newComment, "Comment added");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- GET /api/v1/posts/:id ----
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePhoto college")
      .populate("comments.user", "name profilePhoto")
      .populate("collegeTag", "name");
    if (!post || !post.isActive) {
      return errorResponse(res, 404, "Post not found");
    }

    return successResponse(res, 200, post, "Post fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
