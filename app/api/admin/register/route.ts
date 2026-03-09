import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    await connectDB();
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin already exists." },
        { status: 400 },
      );
    }

    const { name, email, number, password } = await req.json();

    if (!name || !email || !number || !password) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,

      password: hashedPassword,
      role: "admin", // ✅ Automatically defined here
    });

    return NextResponse.json({
      message: "Admin registered successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
