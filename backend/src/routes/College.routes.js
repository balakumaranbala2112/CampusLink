import express from "express";
import {
  createCollege,
  getAllColleges,
  getCollegeById,
} from "../controllers/college.controller.js";

const router = express.Router();

router.get("/", getAllColleges); // GET  /api/v1/colleges
router.get("/:id", getCollegeById); // GET  /api/v1/colleges/:id
router.post("/", createCollege); // POST /api/v1/colleges

export default router;
