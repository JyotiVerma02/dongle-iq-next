import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";

const listParamsSchema = z.object({
  q: z.string().optional().default(""),
  status: z.string().optional().default("all"),
  validity: z.string().optional().default("all"),
  certType: z.string().optional().default("all"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortKey: z.enum(["createdAt", "name", "email", "certType", "status", "validity"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

const deleteSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const STATUS_VALUES = ["pending", "approved", "rejected", "issued"] as const;

function buildApplicantQuery(params: z.infer<typeof listParamsSchema>) {
  const query: Record<string, unknown> = {
    role: { $ne: "admin" },
  };

  if (params.q.trim()) {
    const search = params.q.trim();
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { number: { $regex: search, $options: "i" } },
      { dscId: { $regex: search, $options: "i" } },
      { pan: { $regex: search, $options: "i" } },
    ];
  }

  if (STATUS_VALUES.includes(params.status as (typeof STATUS_VALUES)[number])) {
    query.status = params.status;
  }

  if (params.validity !== "all") {
    query.validity = params.validity;
  }

  if (params.certType !== "all") {
    query.certType = params.certType;
  }

  return query;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const parsed = listParamsSchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const params = parsed.data;
    const query = buildApplicantQuery(params);
    const skip = (params.page - 1) * params.limit;
    const sortDirection = params.sortDir === "asc" ? 1 : -1;

    const [users, filteredTotal, totalApplicants, statusCounts, certTypes, validities] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ [params.sortKey]: sortDirection, createdAt: -1 })
        .skip(skip)
        .limit(params.limit)
        .lean(),
      User.countDocuments(query),
      User.countDocuments({ role: { $ne: "admin" } }),
      User.aggregate([
        { $match: { role: { $ne: "admin" } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      User.distinct("certType", { role: { $ne: "admin" }, certType: { $nin: ["", null] } }),
      User.distinct("validity", { role: { $ne: "admin" }, validity: { $nin: ["", null] } }),
    ]);

    const stats = statusCounts.reduce<Record<string, number>>((acc, item) => {
      acc[String(item._id || "pending")] = Number(item.count || 0);
      return acc;
    }, {});

    const pages = Math.max(1, Math.ceil(filteredTotal / params.limit));

    return NextResponse.json({
      success: true,
      users,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: filteredTotal,
        pages,
      },
      filters: {
        certTypes: certTypes.filter(Boolean).sort(),
        validities: validities.filter(Boolean).sort(),
      },
      stats: {
        total: totalApplicants,
        pending: stats.pending || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        issued: stats.issued || 0,
      },
    });
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch applicants" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const parsed = deleteSchema.safeParse(await req.json());

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: "Invalid delete request" },
        { status: 400 },
      );
    }

    const deletedUser = await User.findOneAndDelete({
      _id: parsed.data.userId,
      role: { $ne: "admin" },
    }).select("-password");

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "Applicant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Applicant deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("ADMIN USERS DELETE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to delete applicant" },
      { status: 500 },
    );
  }
}
