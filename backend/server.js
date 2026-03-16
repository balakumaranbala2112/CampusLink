import "dotenv/config";
import http from "http";
import app from "./app.js";
import connectDB from "./src/config/db.js";
import { initializeSocket } from "./src/socket/socket.js";
import { setSocketIO } from "./src/utils/notification.utils.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // connect to MongoDB first
  await connectDB();

  // create HTTP server from Express app
  // Socket.io needs HTTP server — not just Express app
  // because WebSocket protocol runs on top of HTTP
  const server = http.createServer(app);

  // attach Socket.io to the HTTP server
  const { io, onlineUsers } = initializeSocket(server);

  setSocketIO(io, onlineUsers);
  // start listening on PORT
  // server handles BOTH HTTP requests AND Socket.io connections
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for connections`);
  });
};

startServer();
