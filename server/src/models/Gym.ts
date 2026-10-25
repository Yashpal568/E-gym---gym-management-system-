import { Schema, model, models, type InferSchemaType } from "mongoose";
const gymSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 80 },
  ownerUserId: { type: String, required: true, index: true },
  status: { type: String, enum: ["setup","active","suspended","closed"], default: "setup", index: true },
  timezone: { type: String, default: "Asia/Kolkata", required: true },
  currency: { type: String, enum: ["INR"], default: "INR", required: true }
}, { timestamps: true, strict: "throw" });
export type GymRecord = InferSchemaType<typeof gymSchema>;
export const Gym = models.Gym || model("Gym", gymSchema);