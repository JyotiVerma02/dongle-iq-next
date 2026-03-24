import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    const { mobile, otp, type } = await req.json();

    // 1. Connect to MongoDB Atlas (Cluster0)
    await connectDB();

    // 2. Find the user by mobile number (mapped to 'number' in your schema)
    // We also check if the OTP matches and if the current time is before 'otpExpiry'
    const user = await User.findOne({
      number: mobile,
      otp: otp,
      otpExpiry: { $gt: new Date() }, // OTP must not be expired
    });

    // 3. Log for debugging in your terminal
    console.log(`Verification Attempt - Type: ${type}, Mobile: ${mobile}`);

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Invalid OTP or the code has expired. Please request a new one." 
        },
        { status: 401 }
      );
    }

    // 4. Success Logic: Update user status
    // Since this is for Dongle IQ, we mark them as verified
    user.isVerified = true;
    
    // Optional: Clear OTP fields so the same code can't be used twice
    user.otp = undefined;
    user.otpExpiry = undefined;
    
    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Verification successful" 
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Verify API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}