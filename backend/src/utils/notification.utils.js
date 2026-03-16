import Notification from "../models/Notification.model.js";

// module level variable to store io instance
let io;
// module level variable to store online users map
let onlineUsersMap;

// called once in server.js to store io and onlineUsers
export const setSocketIO = (socketIO, onlineUsers) => {
  io = socketIO;
  onlineUsersMap = onlineUsers;
};

// ── Create and Send Notification ─────────────
// called from controllers whenever something happens
export const createNotification = async ({
  recipientId, // who gets the notification
  senderId, // who triggered it
  type, // what type
  message, // what to say
  link, // where to go when clicked
}) => {
  try {
    // Step 1 — save to MongoDB
    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      link: link || null,
    });

    // populate sender details
    await notification.populate("sender", "name profilePhoto");

    // Step 2 — send via Socket.io if user is online
    if (io && onlineUsersMap) {
      // check if recipient is currently online
      const recipientSocketId = onlineUsersMap.get(recipientId.toString());

      if (recipientSocketId) {
        // user is online → send instantly
        io.to(recipientSocketId).emit("new_notification", {
          _id: notification._id,
          type: notification.type,
          message: notification.message,
          sender: notification.sender,
          link: notification.link,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      }
    }

    return notification;
  } catch (error) {
    // notification failure should not break the main action
    // so we just log the error
    console.error("Notification error:", error.message);
  }
};
