import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { verifySessionToken, isAdminTokenPayload } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const decoded = await verifySessionToken(token);
    const userId = String(decoded.userId);
    const isAdmin = isAdminTokenPayload(decoded);
    
    const { notificationId, markAll } = (await req.json()) as {
      notificationId?: string;
      markAll?: boolean;
    };

    if (!notificationId && !markAll) {
      return NextResponse.json(
        { success: false, message: "Notification ID or markAll is required" },
        { status: 400 },
      );
    }

    if (markAll) {
      const query = isAdmin
        ? { recipientType: "ADMIN", isRead: false }
        : {
            userId,
            $or: [{ recipientType: "USER" }, { recipientType: { $exists: false } }],
            isRead: false,
          };

      await Notification.updateMany(query, { $set: { isRead: true } });
    } else {
      const query = isAdmin
        ? { _id: notificationId, recipientType: "ADMIN" }
        : {
            _id: notificationId,
            userId,
            $or: [{ recipientType: "USER" }, { recipientType: { $exists: false } }],
          };

      const result = await Notification.findOneAndUpdate(query, {
        $set: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notification:read] failed", error);

    return NextResponse.json(
      { success: false, message: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
