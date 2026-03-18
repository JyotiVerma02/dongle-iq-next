import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔥 Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists." },
        { status: 400 }
      );
    }

    const { name, email, number, password } = await req.json();

    // 🔥 Validation
    if (!name || !email || !number || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // 🔥 Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // 🔥 Password length check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // 🔥 Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // 🔥 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 Create Admin
    await User.create({
      name,
      email,
      number, // ✅ FIXED (now stored)
      password: hashedPassword,
      role: "admin",
       isVerified: true
    });

    return NextResponse.json({
      message: "Admin registered successfully",
    });

  } catch (error) {
    console.error("Admin Register Error:", error); // ✅ DEBUGGING
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}