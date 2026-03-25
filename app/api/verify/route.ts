/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    // ✅ Validate input
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number"
      }, { status: 400 });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({
        success: false,
        message: "Invalid OTP format"
      }, { status: 400 });
    }

    await connectDB();

    // ✅ Find user with valid OTP
    const user = await User.findOne({
      number: mobile,
      aadhaarOtp: otp,
      aadhaarOtpExpiry: { $gt: new Date() } // not expired
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Invalid or expired OTP"
      }, { status: 401 });
    }

    // ✅ Update user after successful verification
    user.isVerified = true;
    user.status = "approved";
    user.aadhaarOtp = undefined;
    user.aadhaarOtpExpiry = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Verification Successful"
    });

  } catch (error) {
    console.error("Verify API Error:", error);

    return NextResponse.json({
      success: false,
      message: "Server Error"
    }, { status: 500 });
  }
}