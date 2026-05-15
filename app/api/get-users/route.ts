import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { adminOnly } from "@/app/lib/withAuth";
import type { AuthToken } from "@/app/lib/withAuth";

const handler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users,
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
