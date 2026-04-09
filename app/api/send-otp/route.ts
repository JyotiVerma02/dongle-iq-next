import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    const normalizedMobile = normalizeIndianMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    await connectDB();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    let user = await User.findOne({ number: normalizedMobile });

    if (!user) {
      user = await User.create({
        number: normalizedMobile,
        isVerified: false,
        status: "pending",
      });
    }

    user.aadhaarOtp = otp;
    user.aadhaarOtpExpiry = expiry;

    await user.save();

    console.log("OTP for", normalizedMobile, "is:", otp);

    return NextResponse.json({
      success: true,
      message: "OTP generated (check server console)",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return NextResponse.json({
      success: false,
      message: "Server Error",
    });
  }
}
