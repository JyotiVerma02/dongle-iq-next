import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { adminOnly } from "@/lib/withAuth";
import { connectDB } from "@/lib/mongodb";
import SupportTicket from "@/models/supportTicket";
import User from "@/models/user";

const listSchema = z.object({
  q: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  priority: z.string().optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const handler = async (req: NextRequest) => {
  try {
    await connectDB();

    const parsed = listSchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const params = parsed.data;
    const query: Record<string, unknown> = {};

    if (params.q.trim()) {
      const search = params.q.trim();
      const matchingUsers = await User.find({
        role: { $ne: "admin" },
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { number: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      query.$or = [
        { subject: { $regex: search, $options: "i" } },
        { adminNotes: { $regex: search, $options: "i" } },
        { "messages.message": { $regex: search, $options: "i" } },
        { userId: { $in: matchingUsers.map((user) => user._id) } },
      ];
    }

    if (params.status !== "all") {
      query.status = params.status;
    }

    if (params.priority !== "all") {
      query.priority = params.priority;
    }

    const skip = (params.page - 1) * params.limit;

    const [tickets, total, openCount, inProgressCount, resolvedCount] = await Promise.all([
      SupportTicket.find(query)
        .sort({ lastMessageAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .populate("userId", "name email number status certType")
        .lean(),
      SupportTicket.countDocuments(query),
      SupportTicket.countDocuments({ status: "open" }),
      SupportTicket.countDocuments({ status: "in_progress" }),
      SupportTicket.countDocuments({ status: { $in: ["resolved", "closed"] } }),
    ]);

    return NextResponse.json({
      success: true,
      tickets,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        pages: Math.max(1, Math.ceil(total / params.limit)),
      },
      stats: {
        open: openCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
    });
  } catch (error) {
    console.error("ADMIN SUPPORT TICKETS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch support tickets" },
      { status: 500 },
    );
  }
};

export const GET = adminOnly(handler);
