import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { writeRateLimit } from "../middleware/rate-limit";
import { Branch } from "../models/Branch";
import { Member } from "../models/Member";
import { GymPlan } from "../models/GymPlan";
import { MemberMembership } from "../models/MemberMembership";

export const membershipsRouter = Router();
membershipsRouter.use(requireUser, requireGymMembership);
const enrollSchema = z.object({
  branchId: z.string().refine(Types.ObjectId.isValid),
  memberId: z.string().refine(Types.ObjectId.isValid),
  planId: z.string().refine(Types.ObjectId.isValid),
  startsAt: z.string().datetime().optional()
});

membershipsRouter.get("/", async (req, res, next) => {
  try {
    const gymId = res.locals.gymId as string;
    const allowed = res.locals.allowedBranchIds as string[];
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    const filter: Record<string, unknown> = { gymId };
    if (branchId) {
      if (!Types.ObjectId.isValid(branchId)) return res.status(400).json({ error: "Invalid branch ID." });
      if (allowed.length && !allowed.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
      filter.branchId = branchId;
    } else if (allowed.length) filter.branchId = { $in: allowed };
    const rows = await MemberMembership.find(filter).sort({ createdAt: -1 }).limit(100).populate("memberId", "fullName memberCode phone").lean();
    return res.json({ memberships: rows });
  } catch (error) { return next(error); }
});

membershipsRouter.post("/", writeRateLimit, async (req, res, next) => {
  try {
    const parsed = enrollSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid enrollment details.", details: parsed.error.flatten() });
    const gymId = res.locals.gymId as string;
    const userId = res.locals.authUserId as string;
    const allowed = res.locals.allowedBranchIds as string[];
    const { branchId, memberId, planId } = parsed.data;
    if (allowed.length && !allowed.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
    const [branch, member, plan] = await Promise.all([
      Branch.findOne({ _id: branchId, gymId, isActive: true }).select("_id").lean(),
      Member.findOne({ _id: memberId, gymId, branchId, status: { $ne: "archived" } }).select("_id").lean(),
      GymPlan.findOne({ _id: planId, gymId, branchId, isActive: true }).lean().exec()
    ]);
    if (!branch) return res.status(404).json({ error: "Branch not found." });
    if (!member) return res.status(404).json({ error: "Member not found in this branch." });
    if (!plan) return res.status(404).json({ error: "Active plan not found in this branch." });
    const startsAt = parsed.data.startsAt ? new Date(parsed.data.startsAt) : new Date();
    const expiresAt = new Date(startsAt.getTime() + plan.durationDays * 86400000);
    const enrollment = await MemberMembership.create({ gymId, branchId, memberId, planId, planNameSnapshot: plan.name, pricePaiseSnapshot: plan.pricePaise, startsAt, expiresAt, status: "active", createdByUserId: userId });
    return res.status(201).json({ membership: enrollment });
  } catch (error) { return next(error); }
});
