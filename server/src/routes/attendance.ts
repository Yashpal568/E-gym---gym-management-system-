import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { writeRateLimit } from "../middleware/rate-limit";
import { Branch } from "../models/Branch";
import { Member } from "../models/Member";
import { Attendance } from "../models/Attendance";

export const attendanceRouter = Router();
attendanceRouter.use(requireUser, requireGymMembership);

const checkinSchema = z.object({
  branchId: z.string().refine(Types.ObjectId.isValid),
  memberId: z.string().refine(Types.ObjectId.isValid)
});

attendanceRouter.get("/", async (req, res, next) => {
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
    const since = typeof req.query.since === "string" ? new Date(req.query.since) : new Date(new Date().setHours(0,0,0,0));
    if (Number.isNaN(since.getTime())) return res.status(400).json({ error: "Invalid date filter." });
    filter.checkedInAt = { $gte: since };
    const records = await Attendance.find(filter).sort({ checkedInAt: -1 }).limit(500).populate("memberId", "fullName memberCode").lean();
    return res.json({ attendance: records });
  } catch (error) { return next(error); }
});

attendanceRouter.post("/check-in", writeRateLimit, async (req, res, next) => {
  try {
    const parsed = checkinSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid check-in details.", details: parsed.error.flatten() });
    const gymId = res.locals.gymId as string;
    const userId = res.locals.authUserId as string;
    const allowed = res.locals.allowedBranchIds as string[];
    const { branchId, memberId } = parsed.data;
    if (allowed.length && !allowed.includes(branchId)) return res.status(403).json({ error: "Branch access denied." });
    const [branch, member] = await Promise.all([
      Branch.findOne({ _id: branchId, gymId, isActive: true }).select("_id").lean(),
      Member.findOne({ _id: memberId, gymId, branchId, status: "active" }).select("_id").lean()
    ]);
    if (!branch) return res.status(404).json({ error: "Branch not found." });
    if (!member) return res.status(404).json({ error: "Active member not found in this branch." });
    const open = await Attendance.findOne({ gymId, branchId, memberId, checkedOutAt: null }).lean();
    if (open) return res.status(409).json({ error: "Member is already checked in." });
    const attendance = await Attendance.create({ gymId, branchId, memberId, recordedByUserId: userId, source: "staff" });
    return res.status(201).json({ attendance });
  } catch (error) { return next(error); }
});

attendanceRouter.post("/:attendanceId/check-out", writeRateLimit, async (req, res, next) => {
  try {
    const id = Array.isArray(req.params.attendanceId) ? req.params.attendanceId[0] : req.params.attendanceId;
    if (typeof id !== "string" || !Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid attendance ID." });
    const gymId = res.locals.gymId as string;
    const allowed = res.locals.allowedBranchIds as string[];
    const filter: Record<string, unknown> = { _id: id, gymId, checkedOutAt: null };
    if (allowed.length) filter.branchId = { $in: allowed };
    const record = await Attendance.findOneAndUpdate(filter, { $set: { checkedOutAt: new Date() } }, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ error: "Open attendance record not found in this workspace." });
    return res.json({ attendance: record });
  } catch (error) { return next(error); }
});
