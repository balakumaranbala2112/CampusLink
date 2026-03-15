import express from "express";
import rateLimit from "express-rate-limit";
import {
  sendOTP,
  verifyOTPHandler,
  refreshToken,
  logout,
} from "../controllers/auth.controller.js";

// Extra rate limiting on send-otp endpoint
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: "Too many requests, try again later" },
});

const router = express.Router();

router.post("/send-otp", otpLimiter, sendOTP);
router.post("/verify-otp", verifyOTPHandler);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;
