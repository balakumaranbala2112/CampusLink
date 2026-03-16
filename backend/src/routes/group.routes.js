import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  createGroupPost,
  getGroupPosts,
  getMyGroups,
} from "../controllers/group.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// specific routes BEFORE dynamic routes
router.get("/my-groups", authMiddleware, getMyGroups);
router.get("/", authMiddleware, getAllGroups);
router.post("/", authMiddleware, createGroup);
router.get("/:id", authMiddleware, getGroupById);
router.post("/:id/join", authMiddleware, joinGroup);
router.delete("/:id/leave", authMiddleware, leaveGroup);
router.get("/:id/members", authMiddleware, getGroupMembers);
router.post("/:id/posts", authMiddleware, createGroupPost);
router.get("/:id/posts", authMiddleware, getGroupPosts);

export default router;
