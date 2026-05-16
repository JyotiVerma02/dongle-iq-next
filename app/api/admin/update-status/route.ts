import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import { sendStatusNotifications } from "@/app/lib/notifications";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    const { userId, status, internalRemarks } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    const normalizedStatus = String(status).toLowerCase();
    const remarks = typeof internalRemarks === "string" ? internalRemarks.trim() : "";

    if (!["pending", "approved", "rejected", "issued"].includes(normalizedStatus)) {
      return NextResponse.json(
        { success: false, message: "Invalid status" },
        { status: 400 }
      );
    }

    if (normalizedStatus === "rejected" && !remarks) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        status: normalizedStatus,
        internalRemarks: normalizedStatus === "approved" ? "" : remarks,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    await sendStatusNotifications({
      mobileNumber: updatedUser.number,
      name: updatedUser.name,
      status: normalizedStatus,
      remarks,
    });

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
