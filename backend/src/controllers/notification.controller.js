import Notification from "../models/Notification.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── GET /api/v1/notifications ─────────────────
export const getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // get all notifications for this user
    // newest first
    const notifications = await Notification.find({
      recipient: req.userId,
    })
      .populate("sender", "name profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    return successResponse(
      res,
      200,
      {
        notifications,
        unreadCount,
        page,
        hasMore: notifications.length === limit,
      },
      "Notifications fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── PATCH /api/v1/notifications/:id/read ─────
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.userId, // security — can only mark your own
      },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, notification, "Marked as read");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── PATCH /api/v1/notifications/read-all ─────
export const markAllAsRead = async (req, res) => {
  try {
    // mark ALL unread notifications as read for this user
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { isRead: true },
    );

    return successResponse(res, 200, null, "All notifications marked as read");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/notifications/unread-count ───
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      isRead: false,
    });

    return successResponse(res, 200, { count }, "Unread count fetched");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── DELETE /api/v1/notifications/:id ─────────
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.userId,
    });

    if (!notification) {
      return errorResponse(res, 404, "Notification not found");
    }

    return successResponse(res, 200, null, "Notification deleted");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
