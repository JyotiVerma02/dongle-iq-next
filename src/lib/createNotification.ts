import Notification from "@/models/notification";
import { connectDB } from "@/lib/mongodb";
import { broadcastRealtimeEvent } from "@/lib/realtime";

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
  metadata = {},
}: {
  userId: string;
  title: string;
  message: string;
  type?: string;
  metadata?: Record<string, unknown>;
}) {
  await connectDB();

  if (process.env.NODE_ENV !== "production") {
    console.log("[notification:create] attempting save", {
      userId,
      title,
      type,
    });
  }

  try {
    const notification = await Notification.create({
      userId: String(userId),
      title,
      message,
      type,
      metadata,
      isRead: false,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("[notification:create] saved", {
        notificationId: String(notification._id),
        userId: String(notification.userId),
        type: notification.type,
      });
    }

    broadcastRealtimeEvent("NOTIFICATION_CREATED", {
      notificationId: String(notification._id),
      userId: String(notification.userId),
      title: notification.title,
      type: notification.type,
    });

    return notification;
  } catch (error) {
    console.error("[notification:create] save failed", {
      userId,
      title,
      type,
      error,
    });
    throw error;
  }
}
