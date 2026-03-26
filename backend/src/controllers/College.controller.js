import mongoose from "mongoose";
import College from "../models/college.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ---- GET /api/v1/colleges ----
export const getAllColleges = async (req, res) => {
  try {
    let { page = 1, limit = 10, city, state } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 10;

    const query = {};

    if (city) query.city = new RegExp(`^${city}$`, "i");
    if (state) query.state = new RegExp(`^${state}$`, "i");

    const colleges = await College.find(query)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await College.countDocuments(query);

    return successResponse(
      res,
      200,
      {
        total,
        page,
        limit,
        data: colleges,
      },
      "Colleges fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, "Internal server error");
  }
};

// ---- GET /api/v1/colleges/:id ----
export const getCollegeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, "Invalid college ID");
    }

    const college = await College.findById(id).lean();

    if (!college) {
      return errorResponse(res, 404, "College not found");
    }

    return successResponse(res, 200, college, "College fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- GET /api/v1/colleges ----
export const createCollege = async (req, res) => {
  try {
    let { name, city, state, country } = req.body;

    name = name?.trim();
    city = city?.trim();
    state = state?.trim();
    country = country?.trim();

    if (!name || !city || !state) {
      return errorResponse(res, 400, "Name, city and state are required");
    }

    const college = await College.create({
      name,
      city,
      state,
      country,
    });

    return successResponse(res, 201, college, "College created successfully");
  } catch (error) {
    // Handle duplicate key error (MongoDB unique index)
    if (error.code === 11000) {
      return errorResponse(res, 409, "College already exists");
    }

    // Validation error
    if (error.name === "ValidationError") {
      return errorResponse(res, 400, error.message);
    }

    return errorResponse(res, 500, "Internal server error");
  }
};
