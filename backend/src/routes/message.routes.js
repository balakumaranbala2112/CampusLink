import express from "express";
import {
  getMessageHistory,
  getConversations,
} from "../controllers/message.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/v1/messages/conversations
router.get("/conversations", authMiddleware, getConversations);

// GET /api/v1/messages/:userId
router.get("/:userId", authMiddleware, getMessageHistory);

export default router;
