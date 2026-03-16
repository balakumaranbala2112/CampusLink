import express from "express";
import {
  sendRequest,
  acceptRequest,
  declineRequest,
  getConnections,
  getPendingRequests,
  getSuggestions,
} from "../controllers/connection.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// all routes protected — must be logged in
router.post("/request", authMiddleware, sendRequest);
router.post("/accept", authMiddleware, acceptRequest);
router.post("/decline", authMiddleware, declineRequest);
router.get("/list", authMiddleware, getConnections);
router.get("/pending", authMiddleware, getPendingRequests);
router.get("/suggestions", authMiddleware, getSuggestions);

export default router;
