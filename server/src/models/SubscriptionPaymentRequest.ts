import { Schema, model, models } from "mongoose";
const subscriptionPaymentRequestSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  submittedByUserId: { type: String, required: true },
  planCode: { type: String, required: true, trim: true, maxlength: 60 },
  amountPaise: { type: Number, required: true, min: 1, validate: { validator: Number.isSafeInteger, message: "Amount must be integer paise." } },
  billingPeriod: { type: String, enum: ["monthly","quarterly","yearly"], required: true },
  utrNormalized: { type: String, required: true, trim: true, uppercase: true, maxlength: 64 },
  proofObjectKey: { type: String, trim: true, maxlength: 500, default: "" },
  status: { type: String, enum: ["pending","approved","rejected"], default: "pending", index: true },
  reviewedByAdminUserId: { type: String, default: null },
  reviewedAt: { type: Date, default: null },
  rejectionReason: { type: String, trim: true, maxlength: 1000, default: "" },
  providerReference: { type: String, trim: true, maxlength: 120, default: "" }
}, { timestamps: true, strict: "throw" });
subscriptionPaymentRequestSchema.index({ utrNormalized: 1 }, { unique: true });
subscriptionPaymentRequestSchema.index({ gymId: 1, status: 1, createdAt: -1 });
export const SubscriptionPaymentRequest = models.SubscriptionPaymentRequest || model("SubscriptionPaymentRequest", subscriptionPaymentRequestSchema);