import express from "express";
import { getFeed } from "../controllers/feed.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getFeed);

export default router;
