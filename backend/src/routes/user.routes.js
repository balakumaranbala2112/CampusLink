import express from "express";
import {
  getMyProfile,
  updateMyProfile,
  getUserById,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/v1/users/me
router.get("/me", authMiddleware, getMyProfile);

// PATCH /api/v1/users/me
router.patch("/me", authMiddleware, updateMyProfile);

// GET /api/v1/users/:id
router.get("/:id", authMiddleware, getUserById);

export default router;
