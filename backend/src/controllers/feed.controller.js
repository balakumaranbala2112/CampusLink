import Post from "../models/Post.model.js";
import Connection from "../models/Connection.model.js";
import User from "../models/User.model.js";
import redis from "../config/redis.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ---- GET /api/v1/feed ----
export const getFeed = async (req, res) => {
  try {
    // GET /api/v1/feed?page=1&limit=10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (page === 1) {
      const cacheKey = `feed:${req.userId}`;
      const cachedFeed = await redis.get(cacheKey);

      if (cachedFeed) {
        return successResponse(
          res,
          200,
          JSON.parse(cachedFeed),
          "Feed fetched successfully",
        );
      }
    }

    const myConnections = await Connection.find({
      $or: [{ requester: req.userId }, { receiver: req.userId }],
      status: "accepted",
    });

    const connectionIds = myConnections.map((conn) => {
      return conn.requester.toString() === req.userId
        ? conn.receiver
        : conn.requester;
    });

    const currentUser = await User.findById(req.userId);
    const myCollegeId = currentUser?.college;

    const connectionPosts = await Post.find({
      author: {
        $in: connectionIds,
      },
      isActive: true,
    })
      .populate("author", "name profilePhoto college department")
      .populate("collegeTag", "name")
      .sort({ createdAt: -1 }) // newest first
      .limit(20);

    const collegePosts = myCollegeId
      ? await Post.find({
          collegeTag: myCollegeId,
          author: { $nin: [...connectionIds, req.userId] },
          isActive: true,
        })
          .populate("author", "name profilePhoto college department")
          .populate("collegeTag", "name")
          .sort({ createdAt: -1 })
          .limit(10)
      : [];

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingPosts = await Post.find({
      createdAt: { $gte: sevenDaysAgo }, // last 7 days only
      author: { $nin: [...connectionIds, req.userId] }, // exclude connections + myself
      isActive: true,
    })
      .populate("author", "name profilePhoto college department")
      .populate("collegeTag", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    const allPosts = [
      ...connectionPosts, // spread = unpack array items
      ...collegePosts,
      ...trendingPosts,
    ];

    const seen = new Set();
    const uniqueFeed = allPosts.filter((post) => {
      const id = post._id.toString();
      if (seen.has(id)) return false; // duplicate → remove
      seen.add(id);
      return true;
    });

    // ── Step 7: Paginate ────────────────────────
    const paginatedFeed = uniqueFeed.slice(skip, skip + limit);

    const responseData = {
      posts: paginatedFeed,
      page,
      total: uniqueFeed.length,
      hasMore: uniqueFeed.length > skip + limit,
    };
    if (page === 1) {
      const cacheKey = `feed:${req.userId}`;
      await redis.set(
        cacheKey,
        JSON.stringify(responseData),
        { ex: 120 }, // 120 seconds = 2 minutes
      );
    }

    return successResponse(res, 200, responseData, "Feed fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
