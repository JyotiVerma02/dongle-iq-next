import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {

  try {

    await connectDB();

    const { email, otp } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json({
        message: "Already verified"
      });
    }

    // OTP CHECK
    if (String(user.otp) !== String(otp)) {
      return NextResponse.json(
        { message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // EXPIRY CHECK
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json(
        { message: "OTP expired" },
        { status: 400 }
      );
    }

    // VERIFY USER
    await User.updateOne(
      { email },
      {
        $set: { isVerified: true },
        $unset: { otp: "", otpExpiry: "" }
      }
    );

    return NextResponse.json({
      message: "Email verified successfully"
    });

  } catch (error) {

    console.log(error);

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );

  }
}