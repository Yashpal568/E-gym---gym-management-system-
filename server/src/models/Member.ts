import { Schema, model, models } from "mongoose";
const memberSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  memberCode: { type: String, required: true, trim: true, maxlength: 32 },
  fullName: { type: String, required: true, trim: true, maxlength: 120 },
  phone: { type: String, required: true, trim: true, maxlength: 24 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: "" },
  status: { type: String, enum: ["active","paused","expired","archived"], default: "active", index: true },
  joinedAt: { type: Date, required: true, default: Date.now },
  notes: { type: String, maxlength: 1000, default: "" }
}, { timestamps: true, strict: "throw" });
memberSchema.index({ gymId: 1, branchId: 1, memberCode: 1 }, { unique: true });
memberSchema.index({ gymId: 1, branchId: 1, phone: 1 });
export const Member = models.Member || model("Member", memberSchema);