import mongoose from "mongoose";

const ADMIN_ROLE_VALUES = [
  "super_admin",
  "reviewer",
  "dispatcher",
  "support_team",
  "finance_admin",
] as const;

const AdminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLE_VALUES, default: "super_admin" },
    status: { type: String, default: "pending" },
    otp: String,
    otpExpiry: Date,
    isVerified: { type: Boolean, default: false },
    resetToken: String,
    resetTokenExpiry: Date,
  },
  { timestamps: true }
);

const AdminModel = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export default AdminModel;
