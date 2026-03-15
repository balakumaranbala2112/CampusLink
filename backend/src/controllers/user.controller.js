import User from "../models/User.model.js";
import College from "../models/College.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── GET /api/v1/users/me
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "college",
      "name city state",
    );

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    return successResponse(res, 200, user, "Profile fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── PATCH /api/v1/users/me

export const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "bio",
      "department",
      "year",
      "skills",
      "college",
      "visibility",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.college) {
      const collegeExists = await College.findById(updateData.college);
      if (!collegeExists) {
        return errorResponse(res, 404, "College not found");
      }
    }

    const user = await User.findByIdAndUpdate(req.userId, updateData, {
      new: true,
      runValidators: true,
    }).populate("college", "name city state");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    user.calculateCompleteness();
    await user.save();

    return successResponse(res, 200, user, "Profile updated successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/users/:id

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("college", "name city state")
      .select("-__v");

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    if (user.visibility === "connections") {
      return successResponse(
        res,
        200,
        {
          _id: user._id,
          name: user.name,
          college: user.college,
          department: user.department,
          year: user.year,
          profilePhoto: user.profilePhoto,
          completenessScore: user.completenessScore,
        },
        "Profile fetched successfully",
      );
    }

    return successResponse(res, 200, user, "Profile fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
