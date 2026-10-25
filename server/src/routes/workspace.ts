import { Router } from "express";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { Gym } from "../models/Gym";
import { GymMembership } from "../models/GymMembership";
export const workspaceRouter = Router();
workspaceRouter.get("/", requireUser, async (_req, res, next) => {
  try {
    const userId = res.locals.authUserId as string;
    const memberships = await GymMembership.find({ userId, status: "active" }).select("gymId role branchIds").lean();
    const ids = memberships.map((membership) => membership.gymId);
    const gyms = await Gym.find({ _id: { $in: ids }, status: { $ne: "closed" } }).select("name slug status timezone").lean();
    const byId = new Map(gyms.map((gym) => [gym._id.toString(), gym]));
    res.json({ workspaces: memberships.map((membership) => ({ gym: byId.get(membership.gymId.toString()), role: membership.role, branchIds: membership.branchIds.map((id) => id.toString()) })).filter((item) => item.gym) });
  } catch (error) { next(error); }
});
workspaceRouter.get("/:gymId/context", requireUser, async (req, res, next) => {
  try {
    const membership = await GymMembership.findOne({ gymId: req.params.gymId, userId: res.locals.authUserId, status: "active" }).lean();
    if (!membership) return res.status(403).json({ error: "You do not have access to this gym workspace." });
    const gym = await Gym.findOne({ _id: membership.gymId, status: { $ne: "closed" } }).select("name slug status timezone currency").lean();
    if (!gym) return res.status(404).json({ error: "Gym workspace not found." });
    return res.json({ gym, role: membership.role, branchIds: membership.branchIds.map((id) => id.toString()) });
  } catch (error) { next(error); }
});
workspaceRouter.get("/:gymId/guarded-check", requireUser, requireGymMembership, (_req, res) => res.json({ ok: true, gymId: res.locals.gymId, role: res.locals.gymRole }));