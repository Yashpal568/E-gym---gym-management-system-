import { Schema, model, models } from "mongoose";
const attendanceSchema = new Schema({
  gymId: { type: Schema.Types.ObjectId, ref: "Gym", required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  memberId: { type: Schema.Types.ObjectId, ref: "Member", required: true, index: true },
  checkedInAt: { type: Date, required: true, default: Date.now },
  checkedOutAt: { type: Date, default: null },
  recordedByUserId: { type: String, required: true },
  source: { type: String, enum: ["staff","member_qr","admin"], default: "staff" }
}, { timestamps: true, strict: "throw" });
attendanceSchema.index({ gymId: 1, branchId: 1, memberId: 1, checkedInAt: -1 });
export const Attendance = models.Attendance || model("Attendance", attendanceSchema);