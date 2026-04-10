import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { migrateLegacyAdminUser } from "@/app/lib/admin";

export async function POST(req: Request) {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const { email, password } = await req.json();
    const identifier = String(email || "").trim();

    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Email/mobile and password required" },
        { status: 400 }
      );
    }

    const normalizedEmail = identifier.toLowerCase();
    const normalizedMobile = normalizeIndianMobile(identifier);
    const adminQuery =
      isValidIndianMobile(normalizedMobile) && !identifier.includes("@")
        ? { number: normalizedMobile }
        : { email: normalizedEmail };

    const admin = await Admin.findOne(adminQuery);

    if (admin) {
      if (!(await bcrypt.compare(password, admin.password))) {
        return NextResponse.json({ message: "Invalid email/mobile or password" }, { status: 401 });
      }

      if (!admin.isVerified) {
        return NextResponse.json({ message: "Please verify your email first" }, { status: 403 });
      }

      const token = jwt.sign(
        {
          userId: admin._id,
          role: "admin",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      const response = NextResponse.json({
        message: "Login successful",
        role: "admin",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });

      return response;
    }

    const userQuery =
      isValidIndianMobile(normalizedMobile) && !normalizedEmail.includes("@")
        ? { number: normalizedMobile }
        : { email: normalizedEmail };

    const user = await User.findOne(userQuery);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: "Invalid email/mobile or password" }, { status: 401 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ message: "Please verify your email first" }, { status: 403 });
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
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
