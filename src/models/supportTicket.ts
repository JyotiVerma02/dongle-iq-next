import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 180,
    },
    category: {
      type: String,
      enum: ["application", "payment", "documents", "tracking", "technical", "other"],
      default: "application",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "waiting_on_user", "resolved", "closed"],
      default: "open",
      index: true,
    },
    messages: [
      {
        senderType: {
          type: String,
          enum: ["user", "admin", "system"],
          required: true,
        },
        senderId: {
          type: String,
        },
        senderName: {
          type: String,
        },
        message: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    assignedTo: {
      type: String,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

SupportTicketSchema.index({ userId: 1, createdAt: -1 });
SupportTicketSchema.index({ status: 1, priority: 1, createdAt: -1 });

if (process.env.NODE_ENV !== "production" && mongoose.models.SupportTicket) {
  mongoose.deleteModel("SupportTicket");
}

const SupportTicket =
  mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);

export default SupportTicket;
