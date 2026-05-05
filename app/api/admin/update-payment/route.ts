import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { userId, paymentStatus } = await req.json();

    if (!userId || !paymentStatus) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { paymentStatus },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("PAYMENT UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update payment" },
      { status: 500 }
    );
  }
}