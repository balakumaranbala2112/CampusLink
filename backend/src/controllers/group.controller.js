import Group from "../models/Group.model.js";
import GroupMember from "../models/GroupMember.model.js";
import Post from "../models/Post.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// ── POST /api/v1/groups ──────────────────────
export const createGroup = async (req, res) => {
  try {
    const { name, description, type } = req.body;

    // validate name
    if (!name || name.trim().length === 0) {
      return errorResponse(res, 400, "Group name is required");
    }

    // create the group
    const group = await Group.create({
      name: name.trim(),
      description: description || null,
      creator: req.userId,
      type: type || "public",
    });

    // automatically add creator as admin member
    await GroupMember.create({
      group: group._id,
      user: req.userId,
      role: "admin", // creator is always admin
      status: "active",
    });

    await group.populate("creator", "name profilePhoto");

    return successResponse(res, 201, group, "Group created successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/groups ───────────────────────
export const getAllGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // only show public active groups
    const groups = await Group.find({
      type: "public",
      isActive: true,
    })
      .populate("creator", "name profilePhoto")
      .sort({ memberCount: -1 }) // most popular first
      .skip(skip)
      .limit(limit);

    const total = await Group.countDocuments({
      type: "public",
      isActive: true,
    });

    return successResponse(
      res,
      200,
      {
        groups,
        page,
        total,
        hasMore: total > skip + limit,
      },
      "Groups fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/groups/:id ───────────────────
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate(
      "creator",
      "name profilePhoto",
    );

    if (!group || !group.isActive) {
      return errorResponse(res, 404, "Group not found");
    }

    // check if current user is a member
    const membership = await GroupMember.findOne({
      group: req.params.id,
      user: req.userId,
      status: "active",
    });

    return successResponse(
      res,
      200,
      {
        ...group.toObject(),
        isMember: !!membership, // true or false
        isAdmin: membership?.role === "admin",
      },
      "Group fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── POST /api/v1/groups/:id/join ─────────────
export const joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    // find the group
    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return errorResponse(res, 404, "Group not found");
    }

    // check if already a member
    const existing = await GroupMember.findOne({
      group: groupId,
      user: req.userId,
    });

    if (existing) {
      if (existing.status === "active") {
        return errorResponse(res, 400, "Already a member of this group");
      }
      if (existing.status === "pending") {
        return errorResponse(res, 400, "Join request already pending");
      }
    }

    // public group → join immediately
    // private group → status = pending (wait for admin)
    const status = group.type === "public" ? "active" : "pending";

    await GroupMember.create({
      group: groupId,
      user: req.userId,
      role: "member",
      status,
    });

    // update member count for public groups
    if (group.type === "public") {
      group.memberCount += 1;
      await group.save();
    }

    const message =
      group.type === "public"
        ? "Joined group successfully"
        : "Join request sent. Waiting for admin approval";

    return successResponse(res, 200, { status }, message);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── DELETE /api/v1/groups/:id/leave ──────────
export const leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return errorResponse(res, 404, "Group not found");
    }

    // find membership
    const membership = await GroupMember.findOne({
      group: groupId,
      user: req.userId,
    });

    if (!membership) {
      return errorResponse(res, 400, "You are not a member of this group");
    }

    // creator cannot leave their own group
    if (group.creator.toString() === req.userId) {
      return errorResponse(
        res,
        400,
        "Group creator cannot leave. Delete the group instead",
      );
    }

    // remove membership
    await GroupMember.findByIdAndDelete(membership._id);

    // update member count
    if (membership.status === "active") {
      group.memberCount = Math.max(0, group.memberCount - 1);
      await group.save();
    }

    return successResponse(res, 200, null, "Left group successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/groups/:id/members ───────────
export const getGroupMembers = async (req, res) => {
  try {
    const groupId = req.params.id;

    // check if requester is a member
    const membership = await GroupMember.findOne({
      group: groupId,
      user: req.userId,
      status: "active",
    });

    if (!membership) {
      return errorResponse(res, 403, "You must be a member to view members");
    }

    const members = await GroupMember.find({
      group: groupId,
      status: "active",
    }).populate("user", "name profilePhoto department year college");

    return successResponse(res, 200, members, "Members fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── POST /api/v1/groups/:id/posts ────────────
export const createGroupPost = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { content, type } = req.body;

    if (!content || content.trim().length === 0) {
      return errorResponse(res, 400, "Post content is required");
    }

    // check if user is an active member
    const membership = await GroupMember.findOne({
      group: groupId,
      user: req.userId,
      status: "active",
    });

    if (!membership) {
      return errorResponse(
        res,
        403,
        "You must be a member to post in this group",
      );
    }

    // create post with group tag
    const post = await Post.create({
      author: req.userId,
      content: content.trim(),
      type: type || "short",
      collegeTag: groupId, // using collegeTag field to tag group
    });

    await post.populate("author", "name profilePhoto");

    return successResponse(res, 201, post, "Post created successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/groups/:id/posts ─────────────
export const getGroupPosts = async (req, res) => {
  try {
    const groupId = req.params.id;

    // check membership
    const membership = await GroupMember.findOne({
      group: groupId,
      user: req.userId,
      status: "active",
    });

    if (!membership) {
      return errorResponse(
        res,
        403,
        "You must be a member to view group posts",
      );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      collegeTag: groupId,
      isActive: true,
    })
      .populate("author", "name profilePhoto")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return successResponse(
      res,
      200,
      {
        posts,
        page,
        hasMore: posts.length === limit,
      },
      "Group posts fetched successfully",
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

// ── GET /api/v1/groups/my-groups ─────────────
export const getMyGroups = async (req, res) => {
  try {
    // find all groups I am an active member of
    const memberships = await GroupMember.find({
      user: req.userId,
      status: "active",
    }).populate({
      path: "group",
      populate: { path: "creator", select: "name profilePhoto" },
    });

    const groups = memberships.map((m) => m.group);

    return successResponse(res, 200, groups, "My groups fetched successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
