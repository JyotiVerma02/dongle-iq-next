import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb"; // Adjust path if needed
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    await connectDB();

    // 1. Check if user exists (Optional: Depends on if you want to verify guests)
    const user = await User.findOne({ number: mobile });
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    // 2. Generate a 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // 3. Update User document with OTP and Expiry
    user.otp = generatedOtp;
    user.otpExpiry = expiry;
    await user.save();

    // 4. Call Fast2SMS
    const response = await fetch(
      `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&variables_values=${generatedOtp}&route=otp&numbers=${mobile}`
    );

    const data = await response.json();

    if (data.return) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, message: data.message });
    }
  } catch (error) {
    console.error("OTP Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" });
  }
}