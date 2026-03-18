import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { sendOTP } from "@/app/lib/sendEmail"; // ✅ import your mail function

export async function POST(req: Request) {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists." },
        { status: 400 }
      );
    }

    const { name, email, number, password } = await req.json();

    if (!name || !email || !number || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 STEP 1: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔥 STEP 2: Create Admin with OTP
    await User.create({
      name,
      email,
      number,
      password: hashedPassword,
      role: "admin",
      isVerified: false,
      otp,
      otpExpiry: new Date(Date.now() + 5 * 60 * 1000), // 5 min
    });

    // 🔥 STEP 3: Send OTP email
    await sendOTP(email, otp);

    return NextResponse.json({
      message: "OTP sent to email. Please verify.",
    });

  } catch (error) {
    console.error("Admin Register Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}