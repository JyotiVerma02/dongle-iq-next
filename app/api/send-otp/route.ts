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

    // ✅ Proper WhatsApp OTP Message
    const message = `🔐 *DongleIQ Verification*

Your One-Time Password (OTP) is: *${otp}*

⏳ Valid for 5 minutes  
🔒 Do not share this OTP with anyone  

- Team DongleIQ`;

    const result = await sendWhatsAppMessage(mobile, message);

    if (!result.success) {
      return NextResponse.json({
        success: false,
        message: "Failed to send WhatsApp OTP",
      });
    }

    return NextResponse.json({
      success: true,
      message:
        "A verification OTP has been sent to your WhatsApp number. Please enter it within 5 minutes to continue.",
    });

  } catch (error) {
    console.error("Send OTP Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Server Error",
      },
      { status: 500 }
    );
  }
}