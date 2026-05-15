import mongoose from "mongoose";

const AdminInviteSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true,
    },
    inviteTokenHash: {
      type: String,
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: Date,
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

const AdminInvite =
  mongoose.models.AdminInvite ||
  mongoose.model("AdminInvite", AdminInviteSchema);

export default AdminInvite;
