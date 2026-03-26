import mongoose from "mongoose";
import Message from "../models/Message.model.js";
import Connection from "../models/Connection.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── GET /api/v1/messages/:userId ─────────────
export const getMessageHistory = async (req, res) => {
  try {
    const otherUserId = req.params.userId; // from URL
    const myId = req.userId; // from JWT token

    // Step 1 — security check

    const participants = [myId, otherUserId].sort();

    const connection = await Connection.findOne({
      participants,
      status: "accepted",
    });

    if (!connection) {
      return errorResponse(res, 403, "You can only message your connections");
    }

    // Step 2 — fetch messages between us

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherUserId },
        { sender: otherUserId, receiver: myId },
      ],
      isActive: true,
    })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: 1 })
      .limit(50);
    // Step 3 — mark their messages to me as read

    await Message.updateMany(
      {
        sender: otherUserId,
        receiver: myId,
        isRead: false,
      },
      { isRead: true },
    );

    return successResponse(res, 200, messages, "Messages fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/messages/conversations ───────
export const getConversations = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.userId);
    // mongoose.Types.ObjectId needed for aggregation

    const conversations = await Message.aggregate([
      // Stage 1 — find all messages that involve me
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
          isActive: true,
        },
      },

      // Stage 2 — sort newest first
      { $sort: { createdAt: -1 } },

      // Stage 3 — group by the OTHER person
      {
        $group: {
          // _id = the other person's userId
          _id: {
            $cond: {
              if: { $eq: ["$sender", myId] },
              then: "$receiver",
              else: "$sender",
            },
          },
          // $first keeps only the first (latest) message per group
          lastMessage: { $first: "$$ROOT" },
          // count unread messages
          unreadCount: {
            $sum: {
              $cond: [
                // message is TO me AND unread
                {
                  $and: [
                    { $eq: ["$receiver", myId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1, // count it
                0, // don't count it
              ],
            },
          },
        },
      },

      // Stage 4 — get user details for each conversation partner
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },

      // Stage 5 — $lookup returns array → flatten to single object
      { $unwind: "$user" },

      // Stage 6 — return only fields we need
      {
        $project: {
          user: {
            _id: "$user._id",
            name: "$user.name",
            profilePhoto: "$user.profilePhoto",
          },
          lastMessage: 1, // 1 = include this field
          unreadCount: 1,
        },
      },

      // Stage 7 — sort by latest message first
      { $sort: { "lastMessage.createdAt": -1 } },
    ]);

    return successResponse(
      res,
      200,
      conversations,
      "Conversations fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
