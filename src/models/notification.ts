import mongoose, { Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      default: "general",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);