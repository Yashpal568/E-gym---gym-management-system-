import { Schema, model, models } from "mongoose";
const branchSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  address: { type: String, trim: true, maxlength: 500, default: "" },
  phone: { type: String, trim: true, maxlength: 24, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, strict: "throw" });
branchSchema.index({ gymId: 1, name: 1 }, { unique: true });
export const Branch = models.Branch || model("Branch", branchSchema);