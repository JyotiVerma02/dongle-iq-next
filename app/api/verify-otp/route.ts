import { NextRequest, NextResponse } from "next/server";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, getClientIp, verifyOtpHash } from "@/app/lib/security";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `verify-otp:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many verification attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const { email, otp } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    const user = await User.findOne(
      { email: normalizedEmail },
      { _id: 1, isVerified: 1, otp: 1, otpExpiry: 1 },
    );
    const admin = user
      ? null
      : await Admin.findOne(
          { email: normalizedEmail },
          { _id: 1, isVerified: 1, otp: 1, otpExpiry: 1 },
        );
    const account = user || admin;

    if (!account) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (account.isVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    if (!/^\d{6}$/.test(normalizedOtp) || !verifyOtpHash(account.otp, normalizedOtp)) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (!account.otpExpiry || account.otpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    const accountModel = user ? User : Admin;
    await accountModel.updateOne(
      { _id: account._id },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpiry: "" },
      },
    );

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
