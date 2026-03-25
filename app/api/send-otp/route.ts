
import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { sendWhatsAppMessage } from "@/app/lib/whatsapp";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    // ✅ Validate mobile
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number",
      });
    }

    await connectDB();

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Find or create user
    let user = await User.findOne({ number: mobile });

    if (!user) {
      user = await User.create({
        number: mobile,
        isVerified: false,
        status: "pending",
      });
    }

    // ✅ Save OTP
    user.aadhaarOtp = otp;
    user.aadhaarOtpExpiry = expiry;

    await user.save();

    // ✅ Send WhatsApp OTP
    const message = `🔐 *Your OTP*

OTP: *${otp}*
Valid for 5 minutes`;

    const result = await sendWhatsAppMessage(mobile, message);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to send WhatsApp OTP",
      });
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully on WhatsApp",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 },
    );
  }
}
