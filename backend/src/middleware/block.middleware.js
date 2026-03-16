import Block from "../models/Block.model.js";
import { errorResponse } from "../utils/apiResponse.js";

// checks if block exists between current user and target user
// targetId comes from req.params.id or req.body.receiverId etc
const blockMiddleware = (getTargetId) => async (req, res, next) => {
  try {
    // getTargetId is a function that extracts target user id
    // from req object — different routes store it differently
    const targetId = getTargetId(req);

    if (!targetId) {
      return next(); // no target → skip check
    }

    // check if either user blocked the other
    const block = await Block.findOne({
      $or: [
        { blocker: req.userId, blocked: targetId },
        { blocker: targetId, blocked: req.userId },
      ],
    });

    if (block) {
      return errorResponse(res, 403, "This action is not available");
    }

    next(); // no block → allow ✅
  } catch (error) {
    next(); // on error → allow (don't break the app)
  }
};

export default blockMiddleware;
