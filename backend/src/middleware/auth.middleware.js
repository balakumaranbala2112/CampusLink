import { verifyAccessToken } from "../utils/jwt.utils.js";
import { errorResponse } from "../utils/apiResponse.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startswith("Bearer ")) {
      return errorResponse(res, 401, "Access token required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

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
