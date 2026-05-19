import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { userOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";

const handler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.remarksViewed = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: "Remarks marked as viewed",
    });
  } catch (error) {
    console.error("Mark remarks viewed error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};

export const POST = userOnly(handler);
