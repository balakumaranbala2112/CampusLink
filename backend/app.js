import express from "express";
import cors from "cors";
import helmet from "helmet";
import collegeRoutes from "./src/routes/college.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import connectionRoutes from "./src/routes/connection.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import feedRoutes from "./src/routes/feed.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import messageRoutes from "./src/routes/message.routes.js";

const app = express();

// ---- Middleware -----
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ---- Routes -----
app.use("/api/v1/colleges", collegeRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/feed", feedRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/messages", messageRoutes);

// ---- Health Check ----
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "CampusLink API is running",
  });
});

// ---- 404 Handler ----
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

export default app;
