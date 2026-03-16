import Message from "../models/Message.model.js";
import Connection from "../models/Connection.model.js";

// ── Helper — Create Room ID ───────────────────
// sort both IDs so A+B always equals B+A
const getRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

export const registerChatEvents = (io, socket, onlineUsers) => {
  // ── Event 1: Join Room ─────────────────────
  // user opens a chat window
  // they need to join the room to receive messages
  socket.on("join_room", async ({ otherUserId }) => {
    try {
      // security check — are these users connected?
      const connection = await Connection.findOne({
        $or: [
          { requester: socket.userId, receiver: otherUserId },
          { requester: otherUserId, receiver: socket.userId },
        ],
        status: "accepted",
      });

      // not connected → cannot chat
      if (!connection) {
        socket.emit("error", {
          message: "You can only chat with your connections",
        });
        return; // stop here
      }

      // create room id
      const roomId = getRoomId(socket.userId, otherUserId);

      // join the room
      // now this socket will receive all events in this room
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);

      // tell the frontend they successfully joined
      socket.emit("room_joined", { roomId });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Event 2: Send Message ──────────────────
  // user types a message and hits send
  socket.on("send_message", async ({ receiverId, content }) => {
    try {
      // validate — message cannot be empty
      if (!content || content.trim().length === 0) {
        socket.emit("error", { message: "Message cannot be empty" });
        return;
      }

      // security check — are these users connected?
      const connection = await Connection.findOne({
        $or: [
          { requester: socket.userId, receiver: receiverId },
          { requester: receiverId, receiver: socket.userId },
        ],
        status: "accepted",
      });

      if (!connection) {
        socket.emit("error", {
          message: "You can only message your connections",
        });
        return;
      }

      // save message to MongoDB
      // so it's available in history when chat is reopened
      const message = await Message.create({
        sender: socket.userId,
        receiver: receiverId,
        content: content.trim(),
      });

      // populate sender name and photo
      await message.populate("sender", "name profilePhoto");

      // get room id for these two users
      const roomId = getRoomId(socket.userId, receiverId);

      // send message to EVERYONE in the room
      // io.to() includes the sender too
      // so sender also gets confirmation their message was sent ✅
      io.to(roomId).emit("receive_message", {
        _id: message._id,
        sender: message.sender,
        receiver: receiverId,
        content: message.content,
        isRead: message.isRead,
        createdAt: message.createdAt,
      });

      console.log(`Message sent in room: ${roomId}`);
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });

  // ── Event 3: Typing Indicator ──────────────
  // user starts typing
  // frontend emits this event while user is typing
  socket.on("typing", ({ otherUserId }) => {
    const roomId = getRoomId(socket.userId, otherUserId);

    // tell the OTHER user "someone is typing..."
    // socket.to() = everyone EXCEPT the sender
    socket.to(roomId).emit("user_typing", {
      userId: socket.userId,
    });
  });

  // ── Event 4: Stop Typing ───────────────────
  // user stopped typing (deleted text or paused)
  socket.on("stop_typing", ({ otherUserId }) => {
    const roomId = getRoomId(socket.userId, otherUserId);

    // tell the other user typing stopped
    socket.to(roomId).emit("user_stop_typing", {
      userId: socket.userId,
    });
  });

  // ── Event 5: Mark Messages as Read ─────────
  // user opened the chat and saw the messages
  socket.on("mark_read", async ({ otherUserId }) => {
    try {
      // update all unread messages from otherUser to me → read
      await Message.updateMany(
        {
          sender: otherUserId, // messages from them
          receiver: socket.userId, // to me
          isRead: false, // that are unread
        },
        { isRead: true }, // mark as read
      );

      const roomId = getRoomId(socket.userId, otherUserId);

      // tell the sender their messages were seen
      // shows blue ticks like WhatsApp ✅
      socket.to(roomId).emit("messages_read", {
        by: socket.userId,
      });
    } catch (error) {
      socket.emit("error", { message: error.message });
    }
  });
};
