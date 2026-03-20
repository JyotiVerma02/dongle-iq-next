import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json();

    // ❌ validation
    if (!userId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    await connectDB();

    // 🔥 update and return updated user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true } // VERY IMPORTANT
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}