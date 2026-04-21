import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import logger from "@/app/lib/logger";

const loginSchema = z.object({
  email: z.string().min(1).refine(
    (val) => val.includes("@") || /^\d{10}$/.test(val),
    "Must be a valid email or 10-digit mobile number"
  ),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: validation.error.issues },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const identifier = String(email).trim();

    const normalizedEmail = identifier.toLowerCase();
    const normalizedMobile = normalizeIndianMobile(identifier);
    const adminQuery =
      isValidIndianMobile(normalizedMobile) && !identifier.includes("@")
        ? { number: normalizedMobile }
        : { email: normalizedEmail };

    const admin = await Admin.findOne(adminQuery);

    if (admin) {
      const isValidPassword = await bcrypt.compare(password, admin.password);
      const isVerified = admin.isVerified;

      if (!isValidPassword || !isVerified) {
        // Log failed attempt
        logger.warn(`Failed admin login attempt for: ${identifier}`);
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
      }

      const token = jwt.sign(
        {
          userId: admin._id,
          role: "admin",
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" } // Shorter expiry
      );

      const response = NextResponse.json({
        message: "Login successful",
        role: "admin",
      });

      response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60, // 1 hour
        path: "/",
        sameSite: "strict",
      });

      return response;
    }

    const userQuery =
      isValidIndianMobile(normalizedMobile) && !normalizedEmail.includes("@")
        ? { number: normalizedMobile }
        : { email: normalizedEmail };

    const user = await User.findOne(userQuery);

    if (!user) {
      logger.warn(`User not found: ${identifier}`);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    const isVerified = user.isVerified;

    if (!isValidPassword || !isVerified) {
      logger.warn(`Failed user login attempt for: ${identifier}`);
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1h",
      }
    );

    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
