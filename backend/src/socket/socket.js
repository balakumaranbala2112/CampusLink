import { Server } from "socket.io";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import { registerChatEvents } from "./chat.socket.js";

const onlineUsers = new Map();

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = verifyAccessToken(token);

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("Connection", (socket) => {
    console.log(`Socket connected: ${socket.userId}`);
  });

  onlineUsers.set(socket.userId, socket.id);

  socket.broadcast.emit("user_online", {
    userId: socket.userId,
  });

  registerChatEvents(io, socket, onlineUsers);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.userId}`);

    onlineUsers.delete(socket.userId);

    socket.broadcast.emit("user_offline", {
      userId: socket.userId,
    });
  });

  return io;
};
