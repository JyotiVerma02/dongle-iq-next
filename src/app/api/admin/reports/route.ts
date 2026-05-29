import { NextResponse } from "next/server";

import { adminOnly } from "@/lib/withAuth";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/payment";
import User from "@/models/user";
import {
  ADMIN_REPORTS_CACHE_KEY,
  getCachedJson,
  setCachedJson,
} from "@/lib/dashboardCache";

const handler = async () => {
  try {
    await connectDB();

    const cached = await getCachedJson<Record<string, unknown>>(ADMIN_REPORTS_CACHE_KEY);
    if (cached) {
      return NextResponse.json({ success: true, report: cached });
    }

    const [totalApplicants, pending, approved, rejected, dispatched, delivered, issued, paid, unpaid, revenueResult, recentApplications, statusTrends] =
      await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        User.countDocuments({ role: { $ne: "admin" }, status: "pending" }),
        User.countDocuments({ role: { $ne: "admin" }, status: "approved" }),
        User.countDocuments({ role: { $ne: "admin" }, status: "rejected" }),
        User.countDocuments({ role: { $ne: "admin" }, status: "dispatched" }),
        User.countDocuments({ role: { $ne: "admin" }, status: "delivered" }),
        User.countDocuments({ role: { $ne: "admin" }, status: "issued" }),
        User.countDocuments({ role: { $ne: "admin" }, paymentStatus: "paid" }),
        User.countDocuments({ role: { $ne: "admin" }, paymentStatus: { $in: ["pending", "unpaid"] } }),
        Payment.aggregate([
          { $match: { status: { $in: ["completed", "verified"] } } },
          {
            $group: {
              _id: null,
              revenue: { $sum: "$amount" },
              averageTicket: { $avg: "$amount" },
            },
          },
        ]),
        User.aggregate([
          {
            $match: {
              role: { $ne: "admin" },
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]),
        User.aggregate([
          {
            $match: {
              role: { $ne: "admin" },
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
              },
              total: { $sum: 1 },
              approved: {
                $sum: {
                  $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
                },
              },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        ]),
      ]);

    const revenue = revenueResult[0]?.revenue || 0;
    const averageTicket = revenueResult[0]?.averageTicket || 0;
    const approvalRatio = totalApplicants > 0 ? approved / totalApplicants : 0;

    const report = {
      overview: {
        totalApplicants,
        pending,
        approved,
        rejected,
        dispatched,
        delivered,
        issued,
        paid,
        unpaid,
      },
      finance: {
        revenue,
        averageTicket,
      },
      conversion: {
        approvalRatio,
        fulfillmentRate: totalApplicants > 0 ? issued / totalApplicants : 0,
      },
      trends: {
        recentApplications: recentApplications.map((entry) => ({
          date: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}-${String(entry._id.day).padStart(2, "0")}`,
          count: entry.count,
        })),
        trendSeries: statusTrends.map((entry) => ({
          date: `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}-${String(entry._id.day).padStart(2, "0")}`,
          total: entry.total,
          approved: entry.approved,
        })),
      },
    };

    await setCachedJson(ADMIN_REPORTS_CACHE_KEY, report, 60);

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("ADMIN REPORTS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch report summary" },
      { status: 500 },
    );
  }
};

export const GET = adminOnly(handler);
