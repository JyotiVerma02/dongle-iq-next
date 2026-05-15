import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { adminOnly } from "@/app/lib/withAuth";
import type { AuthToken } from "@/app/lib/withAuth";
import Payment from "@/model/payment";

const handler = async (_req: NextRequest, _decoded: AuthToken) => {
  try {
    void _req;
    void _decoded;
    await connectDB();

    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);
    const payments = await Payment.find({ userId: { $in: userIds } })
      .sort({ createdAt: -1 })
      .lean();

    const latestPaymentByUser = new Map<string, (typeof payments)[number]>();

    for (const payment of payments) {
      const key = String(payment.userId);

      if (!latestPaymentByUser.has(key)) {
        latestPaymentByUser.set(key, payment);
      }
    }

    const hydratedUsers = users.map((user) => {
      const latestPayment = latestPaymentByUser.get(String(user._id));

      return {
        ...user.toObject(),
        latestPayment: latestPayment
          ? {
              _id: String(latestPayment._id),
              amount: latestPayment.amount,
              status: latestPayment.status,
              method: latestPayment.method,
              invoiceNumber: latestPayment.invoiceNumber,
              invoiceDate: latestPayment.invoiceDate,
              invoiceUrl: latestPayment.invoiceUrl,
              razorpayOrderId: latestPayment.razorpayOrderId,
              razorpayPaymentId: latestPayment.razorpayPaymentId,
              createdAt: latestPayment.createdAt,
              updatedAt: latestPayment.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      users: hydratedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
};

export const GET = adminOnly(handler);
