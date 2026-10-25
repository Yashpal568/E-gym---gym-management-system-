import { Schema, model, models } from "mongoose";
const paymentSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  amountPaise: { type: Number, required: true, min: 1, validate: { validator: Number.isSafeInteger, message: "Amount must be an integer number of paise." } },
  currency: { type: String, enum: ["INR"], default: "INR", required: true },
  method: { type: String, enum: ["cash","upi","bank_transfer","card","other"], required: true },
  status: { type: String, enum: ["posted","partially_refunded","refunded","voided"], default: "posted", index: true },
  receivedAt: { type: Date, required: true, default: Date.now },
  reference: { type: String, trim: true, maxlength: 120, default: "" },
  recordedByUserId: { type: String, required: true },
  note: { type: String, trim: true, maxlength: 500, default: "" }
}, { timestamps: true, strict: "throw" });
paymentSchema.index({ gymId: 1, branchId: 1, receivedAt: -1 });
paymentSchema.index({ gymId: 1, memberId: 1, receivedAt: -1 });
export const Payment = models.Payment || model("Payment", paymentSchema);