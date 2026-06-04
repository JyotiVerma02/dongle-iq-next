import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { verifySessionToken } from "@/lib/auth";

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
    const { notificationId } = (await req.json()) as {
      notificationId?: string;
    };

    console.log("[notification:read] request", {
      userId,
      notificationId,
    });

    if (!notificationId) {
      return NextResponse.json(
        { success: false, message: "Notification ID is required" },
        { status: 400 },
      );
    }

    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { $set: { isRead: true } },
    );

    console.log("[notification:read] update result", {
      matched: Boolean(result),
      userId,
      notificationId,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[notification:read] failed", error);

    return NextResponse.json(
      { success: false, message: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}
