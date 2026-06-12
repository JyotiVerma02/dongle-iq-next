import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { verifySessionToken, isAdminTokenPayload } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;

    if (!token) {
      console.log("[notification:get] no token cookie found");
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }

    let decoded;
    try {
      decoded = await verifySessionToken(token);
    } catch (error) {
      console.error("[notification:get] invalid token", error);
      return NextResponse.json({
        notifications: [],
        unreadCount: 0,
      });
    }
    const userId = String(decoded.userId);
    const isAdmin = isAdminTokenPayload(decoded);

    console.log("[notification:get] resolving notifications", {
      userId,
      isAdmin,
      tokenPresent: true,
    });

    const query = isAdmin
      ? { recipientType: "ADMIN" }
      : { recipientType: "USER", userId };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
      ...query,
      isRead: false,
    });

    console.log("[notification:get] query result", {
      userId,
      found: notifications.length,
      unreadCount,
    });

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("[notification:get] failed", error);

    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}
