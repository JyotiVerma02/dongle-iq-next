import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Reset link is missing or invalid"),
  password: z.string().trim().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `reset-password:${ip}`,
      limit: 8,
      windowMs: 30 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many reset attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } },
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const body = await req.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    const admin = user
      ? null
      : await Admin.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        });

    const account = user || admin;

    if (!account) {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired. Please request a new reset link." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    account.password = hashedPassword;
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;
    await account.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Unable to reset password right now. Please try again." }, { status: 500 });
  }
}
