import { randomUUID } from "node:crypto";
import { Router } from "express";
import { Types } from "mongoose";
import { z } from "zod";
import { requireUser } from "../middleware/clerk";
import { requireGymMembership } from "../middleware/tenant";
import { Branch } from "../models/Branch";
import { Gym } from "../models/Gym";
import { GymMembership } from "../models/GymMembership";

type MembershipRecord = {
  gymId: Types.ObjectId;
  role: "owner" | "manager" | "staff";
  branchIds: Types.ObjectId[];
};
type GymRecord = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  status: string;
  timezone: string;
  currency?: string;
};
const createWorkspaceSchema = z.object({
  gymName: z.string().trim().min(2).max(120),
  branchName: z.string().trim().min(2).max(100),
  address: z.string().trim().max(500).optional().default(""),
  phone: z.string().trim().max(24).optional().default(""),
  timezone: z.string().trim().min(1).max(80).optional().default("Asia/Kolkata")
});

export const workspaceRouter = Router();

workspaceRouter.get("/", requireUser, async (_req, res, next) => {
  try {
    const userId = res.locals.authUserId as string;
    const memberships = await GymMembership.find({ userId, status: "active" }).select("gymId role branchIds").lean().exec() as unknown as MembershipRecord[];
    const ids = memberships.map((membership) => membership.gymId);
    const gyms = await Gym.find({ _id: { $in: ids }, status: { $ne: "closed" } }).select("name slug status timezone").lean().exec() as unknown as GymRecord[];
    const byId = new Map<string, GymRecord>(gyms.map((gym) => [gym._id.toString(), gym]));
    res.json({
      workspaces: memberships
        .map((membership) => ({
          gym: byId.get(membership.gymId.toString()),
          role: membership.role,
          branchIds: membership.branchIds.map((id: Types.ObjectId) => id.toString())
        }))
        .filter((item) => item.gym)
    });
  } catch (error) { next(error); }
});

// Create the first gym, branch and owner membership using only the verified Clerk user ID.
workspaceRouter.post("/", requireUser, async (req, res, next) => {
  let createdGymId: Types.ObjectId | undefined;
  try {
    const parsed = createWorkspaceSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid gym setup details.", details: parsed.error.flatten() });
    const userId = res.locals.authUserId as string;
    const { gymName, branchName, address, phone, timezone } = parsed.data;
    const slugBase = gymName.toLowerCase().normalize("NFKD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "gym";
    const gym = await Gym.create({ name: gymName, slug: `${slugBase}-${randomUUID().slice(0, 8)}`, ownerUserId: userId, status: "setup", timezone, currency: "INR" });
    createdGymId = gym._id;
    const branch = await Branch.create({ gymId: gym._id, name: branchName, address, phone, isActive: true });
    await GymMembership.create({ gymId: gym._id, userId, role: "owner", status: "active", branchIds: [branch._id] });
    return res.status(201).json({
      workspace: { gym: { id: gym._id.toString(), name: gym.name, slug: gym.slug, status: gym.status, timezone: gym.timezone, currency: gym.currency }, role: "owner", branch: { id: branch._id.toString(), name: branch.name, address: branch.address, phone: branch.phone } }
    });
  } catch (error) {
    if (createdGymId) {
      await Promise.allSettled([
        GymMembership.deleteMany({ gymId: createdGymId }),
        Branch.deleteMany({ gymId: createdGymId }),
        Gym.deleteOne({ _id: createdGymId })
      ]);
    }
    return next(error);
  }
});

workspaceRouter.get("/:gymId/context", requireUser, async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.gymId)) return res.status(400).json({ error: "Invalid gym workspace ID." });
    const membership = await GymMembership.findOne({ gymId: req.params.gymId, userId: res.locals.authUserId, status: "active" }).lean().exec() as unknown as MembershipRecord | null;
    if (!membership) return res.status(403).json({ error: "You do not have access to this gym workspace." });
    const gym = await Gym.findOne({ _id: membership.gymId, status: { $ne: "closed" } }).select("name slug status timezone currency").lean().exec() as unknown as GymRecord | null;
    if (!gym) return res.status(404).json({ error: "Gym workspace not found." });
    return res.json({ gym, role: membership.role, branchIds: membership.branchIds.map((id: Types.ObjectId) => id.toString()) });
  } catch (error) { next(error); }
});

workspaceRouter.get("/:gymId/guarded-check", requireUser, requireGymMembership, (_req, res) => res.json({ ok: true, gymId: res.locals.gymId, role: res.locals.gymRole }));
