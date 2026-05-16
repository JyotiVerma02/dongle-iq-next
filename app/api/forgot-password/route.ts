import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { createPasswordResetEmail } from "@/app/lib/emailTemplates";
import { transporter } from "@/app/lib/mailer";
import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, getClientIp } from "@/app/lib/security";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

function getAppBaseUrl(req: NextRequest) {
  const origin = req.nextUrl.origin;

  if (origin && origin !== "null") {
    return origin;
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

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

    const user = await User.findOne(
      { email: normalizedEmail },
      { _id: 1, email: 1 },
    );
    const admin = user
      ? null
      : await Admin.findOne(
          { email: normalizedEmail },
          { _id: 1, email: 1 },
        );
    const account = user || admin;

    if (!account) {
      return NextResponse.json(
        { message: "No account found with this email address" },
        { status: 404 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    const accountModel = user ? User : Admin;
    await accountModel.updateOne(
      { _id: account._id },
      {
        $set: {
          resetToken: token,
          resetTokenExpiry,
        },
      },
    );

    const resetLink = `${getAppBaseUrl(req)}/reset-password?token=${token}`;

    const resetEmail = createPasswordResetEmail({ resetLink });
    await transporter.sendMail({
      to: normalizedEmail,
      subject: resetEmail.subject,
      text: resetEmail.text,
      html: resetEmail.html,
    });

    return NextResponse.json({ message: "Reset link sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);

    const message = error instanceof Error && error.message.includes("verified sender identity")
      ? "Unable to send reset email because the configured SendGrid sender address is not verified. Check SENDGRID_FROM_EMAIL and verify the sender in SendGrid."
      : error instanceof Error && error.message.includes("SendGrid connection timed out")
        ? "Unable to reach SendGrid right now. Please try again in a moment."
        : "Unable to send reset email right now. Please try again.";

    return NextResponse.json(
      { message },
      { status: 500 },
    );
  }
}
