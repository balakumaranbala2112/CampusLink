import express from "express";
import cors from "cors";
import helmet from "helmet";
import collegeRoutes from "./src/routes/college.routes.js"; // ← ADD THIS

const app = express();

// ---- Middleware -----
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ---- Routes -----
app.use("/api/v1/colleges", collegeRoutes); 

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
