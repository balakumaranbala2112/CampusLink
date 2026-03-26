import { verifyAccessToken } from "../utils/jwt.utils.js";
import { errorResponse } from "../utils/apiResponse.js";
import { redis } from "../config/redis.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Access token required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);
    console.log(decoded);

    const isBlacklisted = await redis.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return errorResponse(res, 401, "Token invalid");
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Access token expired");
    }
    return errorResponse(res, 401, "Invalid access token");
  }
};

export default authMiddleware;
