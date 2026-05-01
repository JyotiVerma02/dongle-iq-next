export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import logger from "@/app/lib/logger";

const rateLimit = new Map<string, { count: number; timestamp: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(identifier);

  if (!limit) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (now - limit.timestamp > 15 * 60 * 1000) {
    rateLimit.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (limit.count >= 3) return false;

  limit.count++;
  rateLimit.set(identifier, limit);
  return true;
}

export async function POST(req: Request) {
  try {
    const { mobile, otp, action = "send-otp" } = await req.json();

    await connectDB();

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 },
      );
    }

    // Keep helper for future tightening if needed.
    void checkRateLimit;

    if (action === "send-otp") {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

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

      user.aadhaarOtp = generatedOtp;
      user.aadhaarOtpExpiry = otpExpiry;
      await user.save();

      logger.info(`[VERIFY-AADHAAR] OTP for ${mobile}: ${generatedOtp}`);
      console.log(`[VERIFY-AADHAAR] OTP for ${mobile}: ${generatedOtp}`);
      process.stdout.write(`[VERIFY-AADHAAR] OTP for ${mobile}: ${generatedOtp}\n`);

      return NextResponse.json({
        success: true,
        message: "OTP generated (check server console)",
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

      if (user.aadhaarOtp !== otp) {
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
