import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { transporter } from "@/app/lib/mailer";
import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `forgot-password:${ip}`,
      limit: 5,
      windowMs: 30 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many reset requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } },
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const body = await req.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { message: validation.error.issues[0]?.message || "Invalid email" },
        { status: 400 },
      );
    }

    const normalizedEmail = validation.data.email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    const admin = user ? null : await Admin.findOne({ email: normalizedEmail });
    const account = user || admin;

    if (!account) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    account.resetToken = token;
    account.resetTokenExpiry = new Date(Date.now() + 3600000);
    await account.save();

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password</p>
        <a href="${resetLink}"
        style="background:#16a34a;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
        Reset Password
        </a>
        <p>This link expires in 1 hour</p>
      `,
    });

    return NextResponse.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Unable to send reset email right now. Please try again." },
      { status: 500 },
    );
  }
}
