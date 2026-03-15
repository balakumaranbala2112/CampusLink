import bcrypt from "bcryptjs";
import redis from "../config/redis.js";
import { generateOTP, hashOTP, verifyOTP } from "../utils/otp.utils.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.utils.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── POST /api/v1/auth/send-otp ───────────────
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validate phone number
    if (!phone || phone.length !== 10) {
      return errorResponse(res, 400, "Valid 10-digit phone number required");
    }

    // Rate limiting — max 3 OTP requests per hour per phone
    const rateLimitKey = `otp_rate:${phone}`;
    const requestCount = await redis.get(rateLimitKey);

    if (requestCount && parseInt(requestCount) >= 3) {
      return errorResponse(
        res,
        429,
        "Too many OTP requests. Try again after 1 hour",
      );
    }

    // Generate and hash OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);

    // Store hashed OTP in Redis with 10 min expiry
    const otpKey = `otp:${phone}`;
    await redis.set(otpKey, hashedOTP, {
      ex: parseInt(process.env.OTP_EXPIRY_SECONDS),
    });

    // Increment rate limit counter
    if (!requestCount) {
      await redis.set(rateLimitKey, 1, { ex: 3600 }); // 1 hour expiry
    } else {
      await redis.incr(rateLimitKey);
    }

    // In production → send OTP via MSG91/Twilio
    // For development → log to console
    console.log(`📱 OTP for ${phone}: ${otp}`);

    return successResponse(res, 200, null, `OTP sent successfully to ${phone}`);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── POST /api/v1/auth/verify-otp ─────────────
export const verifyOTPHandler = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validate inputs
    if (!phone || !otp) {
      return errorResponse(res, 400, "Phone and OTP are required");
    }

    // Get hashed OTP from Redis
    const otpKey = `otp:${phone}`;
    const hashedOTP = await redis.get(otpKey);

    if (!hashedOTP) {
      return errorResponse(
        res,
        400,
        "OTP expired or not found. Please request a new one",
      );
    }

    // Compare entered OTP with stored hash
    const isValid = await verifyOTP(otp, hashedOTP);

    if (!isValid) {
      return errorResponse(res, 400, "Invalid OTP");
    }

    // Delete OTP from Redis after successful verify
    await redis.del(otpKey);

    // Generate JWT tokens
    // For now use phone as userId — Day 04 we replace with real user._id
    const accessToken = generateAccessToken(phone);
    const refreshToken = generateRefreshToken(phone);

    // Store refresh token in Redis with 30 day expiry
    const refreshKey = `refresh:${phone}`;
    await redis.set(refreshKey, refreshToken, { ex: 30 * 24 * 60 * 60 });

    return successResponse(
      res,
      200,
      {
        accessToken,
        refreshToken,
        isNewUser: true, // Day 04 → check if user exists in DB
      },
      "OTP verified successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── POST /api/v1/auth/refresh-token ──────────
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 400, "Refresh token required");
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    const phone = decoded.userId;

    // Check if refresh token exists in Redis
    const refreshKey = `refresh:${phone}`;
    const storedToken = await redis.get(refreshKey);

    if (!storedToken || storedToken !== refreshToken) {
      return errorResponse(res, 401, "Invalid or expired refresh token");
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(phone);

    return successResponse(
      res,
      200,
      {
        accessToken: newAccessToken,
      },
      "Token refreshed successfully",
    );
  } catch (error) {
    return errorResponse(res, 401, "Invalid refresh token");
  }
};

// ── POST /api/v1/auth/logout ─────────────────
export const logout = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return errorResponse(res, 400, "Phone number required");
    }

    // Delete refresh token from Redis
    const refreshKey = `refresh:${phone}`;
    await redis.del(refreshKey);

    return successResponse(res, 200, null, "Logged out successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
