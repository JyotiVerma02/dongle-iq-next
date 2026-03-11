import { NextRequest, NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { transporter } from "@/app/lib/mailer";

export async function POST(req: NextRequest) {
  try {

    await connectDB();

    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { message: "User already verified" },
        { status: 400 }
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Resend OTP",
      html: `
      <h2>DongleIQ Verification</h2>
      <p>Your new OTP:</p>
      <h1>${otp}</h1>
      <p>Valid for 10 minutes</p>
      `,
    });

    return NextResponse.json({
      message: "OTP resent successfully"
    });

  } catch (error) {

    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );

  }
}