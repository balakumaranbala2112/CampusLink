import express from "express";
import {
  createPost,
  deletePost,
  toggleLike,
  addComment,
  getPostById,
} from "../controllers/post.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// POST   /api/v1/posts          → create a post
// GET    /api/v1/posts/:id      → get single post
// DELETE /api/v1/posts/:id      → delete own post
// POST   /api/v1/posts/:id/like → like or unlike
// POST   /api/v1/posts/:id/comment → add comment

router.post("/", authMiddleware, createPost);
router.get("/:id", authMiddleware, getPostById);
router.delete("/:id", authMiddleware, deletePost);
router.post("/:id/like", authMiddleware, toggleLike);
router.post("/:id/comment", authMiddleware, addComment);

export default router;
