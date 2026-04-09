import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import jwt from "jsonwebtoken";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    const identifier = String(email || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email/mobile and password required" },
        { status: 400 }
      );
    }

    const normalizedMobile = normalizeIndianMobile(identifier);
    const query =
      isValidIndianMobile(normalizedMobile) && !identifier.includes("@")
        ? { number: normalizedMobile }
        : { email: identifier.toLowerCase() };

    const user = await User.findOne(query);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email/mobile or password" },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email first" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
