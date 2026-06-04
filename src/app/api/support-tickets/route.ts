import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { userOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import { invalidateUserDashboardCache } from "@/lib/dashboardCache";
import { createNotification } from "@/lib/createNotification";
import { broadcastRealtimeEvent } from "@/app/api/realtime/route";
import User from "@/models/user";
import SupportTicket from "@/models/supportTicket";

const createTicketSchema = z.object({
  subject: z.string().trim().min(3).max(180),
  category: z
    .enum(["application", "payment", "documents", "tracking", "technical", "other"])
    .default("application"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  message: z.string().trim().min(10).max(4000),
});

const getHandler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const tickets = await SupportTicket.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("SUPPORT TICKETS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch support tickets" },
      { status: 500 },
    );
  }
};

const postHandler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const body = await req.json();
    const validation = createTicketSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid ticket payload",
        },
        { status: 400 },
      );
    }

    const user = await User.findById(decoded.userId).select("name email number");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const ticket = await SupportTicket.create({
      userId: user._id,
      subject: validation.data.subject,
      category: validation.data.category,
      priority: validation.data.priority,
      status: "open",
      messages: [
        {
          senderType: "user",
          senderId: String(user._id),
          senderName: user.name || "User",
          message: validation.data.message,
        },
      ],
      lastMessageAt: new Date(),
    });

    const notification = await createNotification({
      userId: String(user._id),
      title: "Support Ticket Created",
      message: `Your support ticket "${validation.data.subject}" has been created successfully.`,
      type: "support",
      metadata: {
        ticketId: String(ticket._id),
        category: validation.data.category,
        priority: validation.data.priority,
      },
    });

    await invalidateUserDashboardCache(String(user._id));
    broadcastRealtimeEvent("SUPPORT_TICKET_CREATED", {
      userId: String(user._id),
      ticketId: String(ticket._id),
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("SUPPORT TICKETS POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create support ticket" },
      { status: 500 },
    );
  }
};

export const GET = userOnly(getHandler);
export const POST = userOnly(postHandler);
