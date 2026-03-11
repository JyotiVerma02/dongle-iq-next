import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password required" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // ✅ ADD EMAIL VERIFICATION CHECK HERE
    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email first" },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      role: user.role
    });

  } catch (error) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}