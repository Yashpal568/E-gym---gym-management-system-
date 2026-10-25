import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { writeRateLimit } from "../middleware/rate-limit";
import { Branch } from "../models/Branch";
import { Member } from "../models/Member";
export const membersRouter = Router();
const createMemberSchema = z.object({
  branchId: z.string().refine(Types.ObjectId.isValid, "Invalid branch ID"),
  memberCode: z.string().trim().min(1).max(32),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(5).max(24),
  email: z.string().trim().email().max(254).or(z.literal("")).optional(),
  notes: z.string().trim().max(1000).optional()
});
membersRouter.use(requireUser, requireGymMembership);
membersRouter.get("/", async (req, res, next) => {
  try {
    const gymId = res.locals.gymId as string;
    const branchId = typeof req.query.branchId === "string" ? req.query.branchId : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 80) : "";
    const status = typeof req.query.status === "string" && ["active","paused","expired","archived"].includes(req.query.status) ? req.query.status : undefined;
    const filter: Record<string, unknown> = { gymId };
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    if (branchId) {
      if (!Types.ObjectId.isValid(branchId)) return res.status(400).json({ error: "Invalid branch ID." });
      if (allowedBranchIds.length && !allowedBranchIds.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
      filter.branchId = branchId;
    } else if (allowedBranchIds.length) {
      filter.branchId = { $in: allowedBranchIds };
    }
    if (status) filter.status = status;
    if (search) filter.$or = [{ fullName: { $regex: escapeRegex(search), $options: "i" } }, { memberCode: { $regex: escapeRegex(search), $options: "i" } }, { phone: { $regex: escapeRegex(search), $options: "i" } }];
    const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page || "1"), 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit || "25"), 10) || 25));
    const [members, total] = await Promise.all([Member.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), Member.countDocuments(filter)]);
    return res.json({ members, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
});
membersRouter.post("/", writeRateLimit, async (req, res, next) => {
  try {
    const parsed = createMemberSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid member details.", details: parsed.error.flatten() });
    const gymId = res.locals.gymId as string;
    const allowedBranchIds = res.locals.allowedBranchIds as string[];
    const { branchId, ...data } = parsed.data;
    if (allowedBranchIds.length && !allowedBranchIds.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
    const branch = await Branch.findOne({ _id: branchId, gymId, isActive: true }).select("_id").lean();
    if (!branch) return res.status(404).json({ error: "Branch not found in this gym workspace." });
    const member = await Member.create({ ...data, email: data.email || "", gymId, branchId, status: "active" });
    return res.status(201).json({ member });
  } catch (error: any) {
    if (error?.code === 11000) return res.status(409).json({ error: "A member with this code already exists in this branch." });
    return next(error);
  }
});
function escapeRegex(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }