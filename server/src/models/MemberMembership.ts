import { Schema, model, models } from "mongoose";
const memberMembershipSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  planId: { type: Schema.Types.ObjectId, ref: "GymPlan", required: true },
  planNameSnapshot: { type: String, required: true, trim: true, maxlength: 100 },
  pricePaiseSnapshot: { type: Number, required: true, min: 0, validate: { validator: Number.isSafeInteger } },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: true },
  status: { type: String, enum: ["active","expired","cancelled","paused"], default: "active", index: true },
  createdByUserId: { type: String, required: true }
}, { timestamps: true, strict: "throw" });
memberMembershipSchema.index({ gymId: 1, branchId: 1, memberId: 1, expiresAt: -1 });
export const MemberMembership = models.MemberMembership || model("MemberMembership", memberMembershipSchema);