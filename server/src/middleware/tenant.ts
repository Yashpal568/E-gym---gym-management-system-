import { Types } from "mongoose";
import type { RequestHandler } from "express";
import { GymMembership } from "../models/GymMembership";
export const requireGymMembership: RequestHandler = async (req, res, next) => {
  try {
    const userId = res.locals.authUserId as string | undefined;
    const requestedGymId = req.header("x-gym-id");
    if (!userId) return res.status(401).json({ error: "Authentication required." });
    if (!requestedGymId || !Types.ObjectId.isValid(requestedGymId)) return res.status(400).json({ error: "Select a valid gym workspace." });
    const membership = await GymMembership.findOne({ gymId: requestedGymId, userId, status: "active" }).lean();
    if (!membership) return res.status(403).json({ error: "You do not have access to this gym workspace." });
    res.locals.gymId = membership.gymId.toString();
    res.locals.gymRole = membership.role;
    res.locals.allowedBranchIds = membership.branchIds.map((id) => id.toString());
    next();
  } catch (error) { next(error); }
};