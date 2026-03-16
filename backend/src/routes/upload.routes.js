import express from "express";
import {
  uploadProfilePhoto,
  uploadPostImage,
} from "../controllers/upload.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { uploadSingle } from "../middleware/upload.middleware.js";

const router = express.Router();

// POST /api/v1/upload/profile-photo
router.post("/profile-photo", authMiddleware, uploadSingle, uploadProfilePhoto);

// POST /api/v1/upload/post-image
router.post("/post-image", authMiddleware, uploadSingle, uploadPostImage);

export default router;
