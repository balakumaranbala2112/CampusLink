import College from "../models/college.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ---- GET /api/v1/colleges ----
export const getAllColleges = async (req, res) => {
  try {
    const colleges = await College.find().sort({ name: 1 });
    return successResponse(res, 200, colleges, "Colleges fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- GET /api/v1/colleges:id ----

export const getCollegeById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return errorResponse(res, 404, "College not found");
    }

    return successResponse(res, 200, college, "College fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- GET /api/v1/colleges/:id ----

export const createCollege = async (req, res) => {
  try {
    const { name, city, state, country } = req.body;

    const existing = await College.findOne({ name });
    if (existing) {
      return errorResponse(res, 400, "College already exists");
    }

    const college = await College.create({
      name,
      city,
      state,
      country,
    });
    return successResponse(res, 201, college, "College created successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
