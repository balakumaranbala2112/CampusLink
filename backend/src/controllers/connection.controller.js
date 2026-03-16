import Connection from "../models/Connection.model.js";
import User from "../models/User.model.js";
import redis from "../config/redis.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { createNotification } from "../utils/notification.utils.js";

// ── POST /api/v1/connections/request

export const sendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const requesterId = req.userId;

    if (requesterId === receiverId) {
      return errorResponse(res, 400, "You cannot connect with yourself");
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return errorResponse(res, 404, "User not found");
    }

    const dailyKey = `conn_limit:${requesterId}`;
    const dailyCount = await redis.get(dailyKey);

    if (dailyCount && parseInt(dailyCount) >= 20) {
      return errorResponse(
        res,
        429,
        "Daily connection limit reached. Try again Tomorrow",
      );
    }

    const existing = await Connection.findOne({
      $or: [
        { requester: requesterId, receiver: receiverId },
        { requester: receiverId, receiver: requesterId },
      ],
    });

    if (existing) {
      if (existing.status === "pending") {
        return errorResponse(res, 400, "Connection request already sent");
      }

      if (existing.status === "accepted") {
        return errorResponse(res, 400, "Already connected");
      }

      if (existing.status === "declined") {
        existing.status = "pending";
        existing.requester = requesterId;
        existing.receiver = receiverId;
        await existing.save();
        return successResponse(res, 201, existing, "Connection request sent");
      }
    }

    const connection = await Connection.create({
      requester: requesterId,
      receiver: receiverId,
    });

    if (!dailyCount) {
      await redis.set(dailyKey, "1", { ex: 24 * 60 * 60 });
    } else {
      await redis.incr(dailyKey);
    }

    return successResponse(res, 200, connection, "Connection request sent");
  } catch (error) {
    return errorResponse(res, 500, errorResponse);
  }
};

// notify receiver about connection request
await createNotification({
  recipientId: receiverId,
  senderId: requesterId,
  type: "connection_request",
  message: "sent you a connection request",
  link: "/connections",
});

// ── POST /api/v1/connections/accept

export const acceptRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return errorResponse(res, 404, "Connection request not found");
    }

    if (connection.receiver.toString() !== req.userId) {
      return errorResponse(res, 403, "Not authorized to accept this request");
    }

    if (connection.status !== "pending") {
      return errorResponse(res, 400, "Request is not pending");
    }

    connection.status = "accepted";

    await connection.save();
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// notify requester their request was accepted
await createNotification({
  recipientId: connection.requester.toString(),
  senderId: req.userId,
  type: "connection_accept",
  message: "accepted your connection request",
  link: "/connections",
});

// ── POST /api/v1/connections/decline

export const declineRequest = async (req, res) => {
  try {
    const { connectionId } = req.body;

    const connection = await Connection.findById(connectionId);

    if (!connection) {
      return errorResponse(res, 404, "Connection request not found");
    }

    // only the RECEIVER can decline
    if (connection.receiver.toString() !== req.userId) {
      return errorResponse(res, 403, "Not authorized to decline this request");
    }

    if (connection.status !== "pending") {
      return errorResponse(res, 400, "Request is not pending");
    }

    connection.status = "declined";
    await connection.save();

    return successResponse(res, 200, null, "Request declined");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/connections/list

export const getConnections = async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.userId }, { receiver: req.userId }],
      status: "Completed",
    })
      .populate("requester", "name profilePhoto college department")
      .populate("receiver", "name profilePhoto college department");

    const connectedUsers = connections.map((conn) => {
      const isRequester = conn.requester._id.toString() === req.userId;
      return {
        connectionId: conn._id,
        user: isRequester ? conn.receiver : conn.requester,
        connectedAt: conn.updatedAt,
      };
      return successResponse(
        res,
        200,
        connectedUsers,
        "Connections fetched successfully",
      );
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/connections/pending

export const getPendingRequests = async (req, res) => {
  try {
    const pending = await Connection.find({
      receiver: req.userId,
      status: "pending",
    }).populate("requester", "name profilePhoto college department");

    return successResponse(res, 200, pending, "Pending requests fetched");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/connections/suggestions

export const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return errorResponse(res, 404, "User not found");
    }

    const myConnections = await Connection.find({
      $or: [{ requester: req.userId }, { receiver: req.userId }],
    });

    const excludeIds = await User.find({
      _id: { $in: excludeIds },
    }).populate("college", "name city");

    // +20 same college
    const scored = candidate.map((candidate) => {
      let score = 0;

      if (
        currentUser.college &&
        candidate.college &&
        currentUser.college.toString() === candidate.college._id.toString()
      ) {
        score += 20;
      }

      // +10 same department
      if (
        currentUser.department &&
        candidate.department &&
        currentUser.department === candidate.department
      ) {
        score += 10;
      }

      // +5 same year
      if (
        currentUser.year &&
        candidate.year &&
        currentUser.year === candidate.year
      ) {
        score += 5;
      }

      return {
        user: {
          _id: candidate._id,
          name: candidate.name,
          profilePhoto: candidate.profilePhoto,
          college: candidate.college,
          department: candidate.department,
          year: candidate.year,
          skills: candidate.skills,
          completenessScore: candidate.completenessScore,
        },
        score,
        sharedSkills,
      };
    });

    const suggestions = scored.sort((a, b) => b.score - a.score).slice(0, 10);
    return successResponse(
      res,
      200,
      suggestions,
      "Suggestions fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
