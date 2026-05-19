import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { withAuth } from "@/lib/withAuth";
import Payment from "@/models/payment";

const handler = async (req: NextRequest, decoded: { userId: string; role: string }) => {
  try {
    await connectDB();

    const payment = await Payment.findOne({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      payment: payment || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch latest payment",
      },
      { status: 500 },
    );
  }
};

export const GET = withAuth(handler);
