import express from "express";
import { getFeed } from "../controllers/feed.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/v1/feed          → page 1
// GET /api/v1/feed?page=2   → page 2
// GET /api/v1/feed?page=3   → page 3

router.get("/", authMiddleware, getFeed);

export default router;
