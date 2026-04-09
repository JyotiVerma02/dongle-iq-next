import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

export async function POST(req: Request) {
  try {
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

    const user = await User.findOne({ number: normalizedMobile });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.otp !== enteredOtp) {
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

    user.isVerified = true;
    user.status = "approved";
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

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
