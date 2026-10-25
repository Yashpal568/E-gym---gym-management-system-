import { Router } from "express";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { Branch } from "../models/Branch";
export const branchesRouter = Router();
branchesRouter.get("/", requireUser, requireGymMembership, async (_req, res, next) => {
  try {
    const filter: Record<string, unknown> = { gymId: res.locals.gymId, isActive: true };
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    if (allowedBranchIds.length) filter._id = { $in: allowedBranchIds };
    const branches = await Branch.find(filter).select("name address phone").sort({ name: 1 }).lean();
    return res.json({ branches });
  } catch (error) { return next(error); }
});