import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/socket/socket.js";
import { setSocketIO } from "./src/utils/notification.utils.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  const { io, onlineUsers } = initializeSocket(server);

  setSocketIO(io, onlineUsers);

  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for connections`);
  });
};

startServer();
