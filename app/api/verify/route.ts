import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ success: false, message: "Invalid mobile" }, { status: 400 });
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ success: false, message: "Invalid OTP" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({
      number: mobile,
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    // ✅ Manual OTP check (better debugging)
    if (user.aadhaarOtp !== otp) {
      return NextResponse.json({ success: false, message: "Wrong OTP" }, { status: 401 });
    }

    if (!user.aadhaarOtpExpiry || user.aadhaarOtpExpiry < new Date()) {
      return NextResponse.json({ success: false, message: "OTP expired" }, { status: 401 });
    }

    // ✅ Update DB
    user.isVerified = true;
    user.status = "approved";
    user.aadhaarOtp = undefined;
    user.aadhaarOtpExpiry = undefined;

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Verification Successful",
      user
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}