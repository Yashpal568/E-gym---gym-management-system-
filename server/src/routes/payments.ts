import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { writeRateLimit } from "../middleware/rate-limit";
import { Branch } from "../models/Branch";
import { Member } from "../models/Member";
import { Payment } from "../models/Payment";

export const paymentsRouter = Router();
paymentsRouter.use(requireUser, requireGymMembership);
const paymentSchema = z.object({
  branchId: z.string().refine(Types.ObjectId.isValid),
  memberId: z.string().refine(Types.ObjectId.isValid),
  amountPaise: z.number().int().min(1).max(Number.MAX_SAFE_INTEGER),
  method: z.enum(["cash","upi","bank_transfer","card","other"]),
  reference: z.string().trim().max(120).optional().default(""),
  note: z.string().trim().max(500).optional().default("")
});

paymentsRouter.get("/", async (req, res, next) => {
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
    const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page || "1"), 10) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit || "50"), 10) || 50));
    const [payments, total] = await Promise.all([
      Payment.find(filter).sort({ receivedAt: -1 }).skip((page - 1) * limit).limit(limit).populate("memberId", "fullName memberCode").lean(),
      Payment.countDocuments(filter)
    ]);
    return res.json({ payments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
});

paymentsRouter.post("/", writeRateLimit, async (req, res, next) => {
  try {
    const parsed = paymentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payment details.", details: parsed.error.flatten() });
    const gymId = res.locals.gymId as string;
    const userId = res.locals.authUserId as string;
    const allowed = res.locals.allowedBranchIds as string[];
    const { branchId, memberId, ...data } = parsed.data;
    if (allowed.length && !allowed.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
    const [branch, member] = await Promise.all([
      Branch.findOne({ _id: branchId, gymId, isActive: true }).select("_id").lean(),
      Member.findOne({ _id: memberId, gymId, branchId, status: { $ne: "archived" } }).select("_id").lean()
    ]);
    if (!branch) return res.status(404).json({ error: "Branch not found." });
    if (!member) return res.status(404).json({ error: "Member not found in this branch." });
    // Posted financial records are append-only. Editing/deleting is intentionally not exposed.
    const payment = await Payment.create({ ...data, gymId, branchId, memberId, recordedByUserId: userId, status: "posted", currency: "INR" });
    return res.status(201).json({ payment });
  } catch (error) { return next(error); }
});
