export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { connectDB } from "@/lib/mongodb";
import { createAdminNotification, sendOtpViaSms } from "@/lib/notifications";
import User from "@/models/user";
import { enforceRateLimit, generateNumericOtp, getClientIp, hashOtp, minutesFromNow } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `send-otp:${ip}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json({
        success: false,
        message: "Too many OTP requests. Please try again later.",
      }, {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) },
      });
    }

    const { mobile } = await req.json();
    const normalizedMobile = normalizeIndianMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number",
      }, { status: 400 });
    }

    const otp = generateNumericOtp();
    const otpExpiry = minutesFromNow(5);

    await connectDB();

    let user = await User.findOne({ number: normalizedMobile });

    if (!user) {
      const password = await bcrypt.hash("temp123", 10);

      user = await User.create({
        name: "Pending User",
        email: `${normalizedMobile}@temp.com`,
        number: normalizedMobile,
        password,
        isVerified: false,
        status: "pending",
      });

      await createAdminNotification({
        title: "New Pending User Created",
        message: `A new pending user record was created for ${normalizedMobile}.`,
        type: "user",
        metadata: {
          userId: String(user._id),
          number: normalizedMobile,
          source: "send-otp",
        },
      });
    }

    user.otp = hashOtp(otp);
    user.otpExpiry = otpExpiry;
    await user.save();

    const smsResult = await sendOtpViaSms({
      mobileNumber: normalizedMobile,
      otp,
      expiryMinutes: 5,
    });

    return NextResponse.json({
      success: true,
      message: smsResult.sent
        ? "OTP sent successfully"
        : "OTP generated, but SMS is not configured. Please contact support.",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : "Unable to send OTP. Please try again.";

    return NextResponse.json({
      success: false,
      message,
    }, { status: 500 });
  }
}
