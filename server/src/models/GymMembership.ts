import { Schema, model, models } from "mongoose";
const gymMembershipSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  userId: { type: String, required: true, index: true },
  role: { type: String, enum: ["owner","manager","staff"], required: true },
  status: { type: String, enum: ["invited","active","revoked"], default: "active", index: true },
  branchIds: [{ type: Schema.Types.ObjectId, ref: "Branch" }]
}, { timestamps: true, strict: "throw" });
gymMembershipSchema.index({ gymId: 1, userId: 1 }, { unique: true });
export const GymMembership = models.GymMembership || model("GymMembership", gymMembershipSchema);