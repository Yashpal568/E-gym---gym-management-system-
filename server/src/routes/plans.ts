import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { writeRateLimit } from "../middleware/rate-limit";
import { Branch } from "../models/Branch";
import { GymPlan } from "../models/GymPlan";

export const plansRouter = Router();
plansRouter.use(requireUser, requireGymMembership);

const createPlanSchema = z.object({
  branchId: z.string().refine((value) => Types.ObjectId.isValid(value), "Invalid branch ID."),
  name: z.string().trim().min(2).max(100),
  durationDays: z.number().int().min(1).max(3660),
  pricePaise: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  description: z.string().trim().max(500).optional().default("")
});

plansRouter.get("/", async (req, res, next) => {
  try {
    const gymId = res.locals.gymId as string;
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    const filter: Record<string, unknown> = { gymId, isActive: true };
    if (branchId) {
      if (!Types.ObjectId.isValid(branchId)) return res.status(400).json({ error: "Invalid branch ID." });
      if (allowedBranchIds.length && !allowedBranchIds.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
      filter.branchId = branchId;
    } else if (allowedBranchIds.length) filter.branchId = { $in: allowedBranchIds };
    const plans = await GymPlan.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return res.json({ plans });
  } catch (error) { return next(error); }
});

plansRouter.post("/", writeRateLimit, async (req, res, next) => {
  try {
    const parsed = createPlanSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid membership plan.", details: parsed.error.flatten() });
    const gymId = res.locals.gymId as string;
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    const { branchId, ...data } = parsed.data;
    if (allowedBranchIds.length && !allowedBranchIds.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
    const branch = await Branch.findOne({ _id: branchId, gymId, isActive: true }).select("_id").lean();
    if (!branch) return res.status(404).json({ error: "Branch not found in this gym workspace." });
    const plan = await GymPlan.create({ ...data, gymId, branchId, isActive: true });
    return res.status(201).json({ plan });
  } catch (error: any) {
    if (error?.code === 11000) return res.status(409).json({ error: "A plan with this name already exists for this branch." });
    return next(error);
  }
});

plansRouter.patch("/:planId/archive", writeRateLimit, async (req, res, next) => {
  try {
    const planId = Array.isArray(req.params.planId) ? req.params.planId[0] : req.params.planId;
    if (typeof planId !== "string" || !Types.ObjectId.isValid(planId)) return res.status(400).json({ error: "Invalid plan ID." });
    const gymId = res.locals.gymId as string;
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    const filter: Record<string, unknown> = { _id: planId, gymId, isActive: true };
    if (allowedBranchIds.length) filter.branchId = { $in: allowedBranchIds };
    const plan = await GymPlan.findOneAndUpdate(filter, { $set: { isActive: false } }, { new: true, runValidators: true });
    if (!plan) return res.status(404).json({ error: "Active plan not found in this workspace." });
    return res.json({ plan });
  } catch (error) { return next(error); }
});
