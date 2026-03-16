import cloudinary from "../config/cloudinary";
import User from "../models/User.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";

// ---- POST /api/v1/upload/profile-photo ----
export const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No image file provided");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "campuslink/profiles",
    );

    const photoUrl = result.secure_url;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profilePhoto: photoUrl },
      { new: true },
    );

    return successResponse(
      res,
      200,
      {
        profilePhoto: photoUrl,
        user,
      },
      "Profile photo uploaded successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ---- POST /api/v1/upload/post-image ----

export const uploadPostImage = async (req, res) => {
  try {
    if (!req.file) {
      return errorResponse(res, 400, "No image file provided");
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      "campuslink/posts",
    );

    return successResponse(
      res,
      200,
      {
        mediaUrl: result.secure_url,
      },
      "Image uploaded successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
