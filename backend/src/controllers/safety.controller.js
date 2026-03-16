import Report from "../models/Report.model.js";
import Block from "../models/Block.model.js";
import Post from "../models/Post.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── POST /api/v1/safety/report ───────────────
export const submitReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, description } = req.body;

    // validate required fields
    if (!targetType || !targetId || !reason) {
      return errorResponse(
        res,
        400,
        "targetType, targetId and reason are required",
      );
    }

    // cannot report yourself
    if (targetId === req.userId) {
      return errorResponse(res, 400, "You cannot report yourself");
    }

    // check if already reported this content
    const existing = await Report.findOne({
      reporter: req.userId,
      targetId,
    });

    if (existing) {
      return errorResponse(res, 400, "You have already reported this content");
    }

    // create the report
    const report = await Report.create({
      reporter: req.userId,
      targetType,
      targetId,
      reason,
      description: description || null,
    });

    // ── Auto-hide Logic ───────────────────────
    // if 3 or more unique users reported the same post
    // automatically hide it until admin reviews
    if (targetType === "post") {
      const reportCount = await Report.countDocuments({ targetId });

      if (reportCount >= 3) {
        await Post.findByIdAndUpdate(targetId, { isActive: false });
        console.log(
          `⚠️ Post ${targetId} auto-hidden after ${reportCount} reports`,
        );
      }
    }

    return successResponse(
      res,
      201,
      report,
      "Report submitted successfully. Our team will review it within 24 hours.",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── POST /api/v1/safety/block/:userId ────────
export const blockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    // cannot block yourself
    if (blockedUserId === req.userId) {
      return errorResponse(res, 400, "You cannot block yourself");
    }

    // check if already blocked
    const existing = await Block.findOne({
      blocker: req.userId,
      blocked: blockedUserId,
    });

    if (existing) {
      return errorResponse(res, 400, "User is already blocked");
    }

    // create block
    await Block.create({
      blocker: req.userId,
      blocked: blockedUserId,
    });

    return successResponse(res, 200, null, "User blocked successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── DELETE /api/v1/safety/block/:userId ──────
export const unblockUser = async (req, res) => {
  try {
    const blockedUserId = req.params.userId;

    const block = await Block.findOneAndDelete({
      blocker: req.userId,
      blocked: blockedUserId,
    });

    if (!block) {
      return errorResponse(res, 404, "Block not found");
    }

    return successResponse(res, 200, null, "User unblocked successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/safety/blocked ───────────────
export const getBlockedUsers = async (req, res) => {
  try {
    // find all users I have blocked
    const blocks = await Block.find({
      blocker: req.userId,
    }).populate("blocked", "name profilePhoto college department");

    const blockedUsers = blocks.map((b) => b.blocked);

    return successResponse(
      res,
      200,
      blockedUsers,
      "Blocked users fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
