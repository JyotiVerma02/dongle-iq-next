import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { enforceRateLimit, getClientIp, verifyOtpHash } from "@/app/lib/security";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `verify-mobile:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many verification attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    const { mobile, otp } = await req.json();
    const normalizedMobile = normalizeIndianMobile(mobile);
    const enteredOtp = otp?.toString().trim();

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json(
        { success: false, message: "Invalid mobile number" },
        { status: 400 }
      );
    }

    if (!enteredOtp || !/^\d{6}$/.test(enteredOtp)) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP format" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne(
      { number: normalizedMobile },
      { _id: 1, otp: 1, otpExpiry: 1 },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!verifyOtpHash(user.otp, enteredOtp)) {
      return NextResponse.json(
        { success: false, message: "Incorrect OTP" },
        { status: 401 }
      );
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP expired" },
        { status: 401 }
      );
    }

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          status: "pending",
        },
        $unset: {
          otp: "",
          otpExpiry: "",
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Verification Successful",
    });
  } catch (error) {
    console.error("Verify API Error:", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}
