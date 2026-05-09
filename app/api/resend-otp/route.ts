import { NextRequest, NextResponse } from "next/server";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { transporter } from "@/app/lib/mailer";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, generateNumericOtp, getClientIp, hashOtp, minutesFromNow } from "@/app/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `resend-otp:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many OTP requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    const admin = user ? null : await Admin.findOne({ email: normalizedEmail });
    const account = user || admin;

    if (!account) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (account.isVerified) {
      return NextResponse.json({ message: "User already verified" }, { status: 400 });
    }

    const otp = generateNumericOtp();

    account.otp = hashOtp(otp);
    account.otpExpiry = minutesFromNow(10);
    await account.save();

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Resend OTP",
      html: `
      <h2>DongleIQ Verification</h2>
      <p>Your new OTP:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes</p>
      `,
    });

    return NextResponse.json({ message: "OTP resent successfully" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
