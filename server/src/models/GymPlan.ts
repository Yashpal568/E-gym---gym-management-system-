import { Schema, model, models } from "mongoose";
const gymPlanSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  durationDays: { type: Number, required: true, min: 1, max: 3660 },
  pricePaise: { type: Number, required: true, min: 0, validate: { validator: Number.isSafeInteger, message: "Price must be integer paise." } },
  isActive: { type: Boolean, default: true, index: true },
  description: { type: String, trim: true, maxlength: 500, default: "" }
}, { timestamps: true, strict: "throw" });
gymPlanSchema.index({ gymId: 1, branchId: 1, name: 1 }, { unique: true });
export const GymPlan = models.GymPlan || model("GymPlan", gymPlanSchema);