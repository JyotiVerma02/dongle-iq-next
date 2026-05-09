import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import logger from "@/app/lib/logger";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";
import { setAuthCookie, signAuthToken } from "@/app/lib/auth";

const loginSchema = z.object({
  email: z.string().min(1).refine(
    (val) => val.includes("@") || /^\d{10}$/.test(val),
    "Must be a valid email or 10-digit mobile number"
  ),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `login:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: validation.error.issues[0]?.message || "Invalid input",
          errors: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, remember = false } = validation.data;
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

      if (!isValidPassword) {
        logger.warn(`Failed admin login attempt for: ${identifier}`);
        return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
      }

      if (!isVerified) {
        logger.warn(`Unverified admin login attempt for: ${identifier}`);
        return NextResponse.json(
          { message: "Account not verified. Please verify your email first." },
          { status: 403 }
        );
      }

      const token = signAuthToken(
        {
          userId: String(admin._id),
          role: "admin",
        },
        remember ? "7d" : "1h"
      );

      const response = NextResponse.json({
        message: "Login successful",
        role: "admin",
      });

      setAuthCookie(response, token, remember);

      return response;
    }

    const userQuery =
      isValidIndianMobile(normalizedMobile) && !normalizedEmail.includes("@")
        ? { number: normalizedMobile }
        : { email: normalizedEmail };

    const user = await User.findOne(userQuery);

    if (!user) {
      logger.warn(`User not found: ${identifier}`);
      return NextResponse.json({ message: "No account found with this email or mobile number" }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    const isVerified = user.isVerified;

    if (!isValidPassword) {
      logger.warn(`Failed user login attempt for: ${identifier}`);
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }

    if (!isVerified) {
      logger.warn(`Unverified user login attempt for: ${identifier}`);
      return NextResponse.json(
        { message: "Account not verified. Please complete OTP verification first." },
        { status: 403 }
      );
    }

    const token = signAuthToken(
      {
        userId: String(user._id),
        role: user.role,
      },
      remember ? "7d" : "1h"
    );

    const response = NextResponse.json({
      message: "Login successful",
      role: user.role,
    });

    setAuthCookie(response, token, remember);

    return response;
  } catch (error) {
    logger.error("Login error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
