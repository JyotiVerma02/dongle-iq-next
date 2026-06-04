import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { withAuth, type AuthToken } from "@/lib/withAuth";
import { getTokenAdminRole, isAdminTokenPayload } from "@/lib/auth";
import { resolveAdminActor } from "@/lib/admin";
import { invalidateUserDashboardCache } from "@/lib/dashboardCache";
import { createNotification } from "@/lib/createNotification";
import { broadcastRealtimeEvent } from "@/app/api/realtime/route";
import SupportTicket from "@/models/supportTicket";

const updateSchema = z.object({
  ticketId: z.string().trim().min(1),
  message: z.string().trim().min(1).max(4000),
  status: z
    .enum(["open", "in_progress", "waiting_on_user", "resolved", "closed"])
    .optional(),
  adminNotes: z.string().trim().max(2000).optional(),
});

async function handler(req: NextRequest, decoded: AuthToken) {
  try {
    await connectDB();

    const adminRole = getTokenAdminRole(decoded);
    const isAdmin = Boolean(adminRole || isAdminTokenPayload(decoded));

    const body = await req.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid ticket update",
        },
        { status: 400 },
      );
    }

    const ticketId = validation.data.ticketId;

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
      return NextResponse.json(
        { success: false, message: "Invalid ticket id" },
        { status: 400 },
      );
    }

    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { success: false, message: "Ticket not found" },
        { status: 404 },
      );
    }

    const isOwner = String(ticket.userId) === decoded.userId;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 },
      );
    }

    const actor = isAdmin
      ? await resolveAdminActor(decoded.userId)
      : null;

    ticket.messages.push({
      senderType: isAdmin ? "admin" : "user",
      senderId: decoded.userId,
      senderName: isAdmin ? actor?.name || "Admin" : "User",
      message: validation.data.message,
      createdAt: new Date(),
    });

    ticket.lastMessageAt = new Date();

    if (isAdmin) {
      if (validation.data.status) {
        ticket.status = validation.data.status;
        if (validation.data.status === "resolved" || validation.data.status === "closed") {
          ticket.resolvedAt = new Date();
        }
      }
      if (validation.data.adminNotes) {
        ticket.adminNotes = validation.data.adminNotes;
      }
      ticket.assignedTo = actor?.name || ticket.assignedTo;
    } else if (ticket.status === "resolved" || ticket.status === "closed") {
      ticket.status = "waiting_on_user";
    }

    await ticket.save();

    if (isAdmin) {
      const notification = await createNotification({
        userId: String(ticket.userId),
        title: validation.data.status
          ? "Support Ticket Updated"
          : "Support Ticket Replied",
        message: validation.data.status
          ? `Your support ticket status is now ${validation.data.status}.`
          : "Your support ticket has a new reply from support.",
        type: "support",
        metadata: {
          ticketId: String(ticket._id),
          status: ticket.status,
          updatedBy: actor?.name || "Admin",
        },
      });

    }

    await invalidateUserDashboardCache(String(ticket.userId));
    broadcastRealtimeEvent("SUPPORT_TICKET_UPDATE", {
      userId: String(ticket.userId),
      ticketId: String(ticket._id),
      status: ticket.status,
    });

    return NextResponse.json({
      success: true,
      ticket,
    });
  } catch (error) {
    console.error("SUPPORT TICKET PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update ticket" },
      { status: 500 },
    );
  }
}

export const PATCH = withAuth(handler);
