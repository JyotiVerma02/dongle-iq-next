import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import Notification from "@/models/notification";

const handler = async () => {
  try {
    await connectDB();

    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .lean();

    console.log("[debug-notifications] total", notifications.length);

    return NextResponse.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("[debug-notifications] failed", error);

    return NextResponse.json(
      { success: false, message: "Failed to load debug notifications" },
      { status: 500 },
    );
  }
};

export const GET = withAuth(handler, {
  requireAuth: true,
  requireRoles: ["admin", "superadmin"],
});
