import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}