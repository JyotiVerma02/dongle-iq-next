export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";
import logger from "@/app/lib/logger";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    const normalizedMobile = normalizeIndianMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number",
      }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

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
    }

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    logger.info(`[SEND-OTP] OTP for ${normalizedMobile}: ${otp}`);
    console.log(`[SEND-OTP] OTP for ${normalizedMobile}: ${otp}`);
    process.stdout.write(`[SEND-OTP] OTP for ${normalizedMobile}: ${otp}\n`);

    return NextResponse.json({
      success: true,
      message: "OTP generated (check server console)",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return NextResponse.json({
      success: false,
      message: "Server Error",
    }, { status: 500 });
  }
}
