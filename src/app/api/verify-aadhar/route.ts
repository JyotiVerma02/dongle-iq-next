export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { sendOtpViaSms } from "@/lib/notifications";
import { enforceRateLimit, generateNumericOtp, getClientIp, hashOtp, minutesFromNow, verifyOtpHash } from "@/lib/security";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `verify-aadhaar:${ip}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } },
      );
    }

    const { mobile, otp, action = "send-otp" } = await req.json();

    await connectDB();

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 },
      );
    }

    if (action === "send-otp") {
      const generatedOtp = generateNumericOtp();
      const otpExpiry = minutesFromNow(5);

      let user = await User.findOne({ number: mobile });

      if (!user) {
        const password = await bcrypt.hash("temp123", 10);

        user = await User.create({
          name: "Pending User",
          email: `${mobile}@temp.com`,
          number: mobile,
          password,
          isVerified: false,
          isAadhaarVerified: false,
          status: "pending",
        });
      }

      user.aadhaarOtp = hashOtp(generatedOtp);
      user.aadhaarOtpExpiry = otpExpiry;
      await user.save();

      await sendOtpViaSms({
        mobileNumber: mobile,
        otp: generatedOtp,
        expiryMinutes: 5,
      });

      return NextResponse.json({
        success: true,
        message: "OTP sent successfully",
      });
    }

    if (action === "verify") {
      if (!otp || !/^\d{6}$/.test(otp)) {
        return NextResponse.json(
          { success: false, message: "Invalid OTP" },
          { status: 400 },
        );
      }

      const user = await User.findOne({ number: mobile });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 },
        );
      }

      if (!verifyOtpHash(user.aadhaarOtp, otp)) {
        return NextResponse.json(
          { success: false, message: "Wrong OTP" },
          { status: 401 },
        );
      }

      if (!user.aadhaarOtpExpiry || user.aadhaarOtpExpiry < new Date()) {
        return NextResponse.json(
          { success: false, message: "OTP expired" },
          { status: 401 },
        );
      }

      user.isAadhaarVerified = true;
      user.status = "pending";
      user.aadhaarOtp = undefined;
      user.aadhaarOtpExpiry = undefined;

      await user.save();

      return NextResponse.json({
        success: true,
        message: "Aadhaar Verified Successfully",
        user: {
          number: user.number,
          isAadhaarVerified: user.isAadhaarVerified,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Aadhaar API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 },
    );
  }
}
