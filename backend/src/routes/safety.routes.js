import express from "express";
import {
  submitReport,
  blockUser,
  unblockUser,
  getBlockedUsers,
} from "../controllers/safety.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// all routes protected
router.post("/report", authMiddleware, submitReport);
router.post("/block/:userId", authMiddleware, blockUser);
router.delete("/block/:userId", authMiddleware, unblockUser);
router.get("/blocked", authMiddleware, getBlockedUsers);

export default router;
