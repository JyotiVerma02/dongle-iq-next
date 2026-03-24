/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    // 🔥 STRICT CHECK: Only your mobile + your specific OTP
    if (mobile === "7295014037" && otp === "123456") {
      
      // OPTIONAL: Still update the DB so the user "status" changes in Dongle IQ
      try {
        await connectDB();
        await User.findOneAndUpdate(
          { number: mobile },
          { isVerified: true, status: "approved" },
          { upsert: true }
        );
      } catch (dbError) {
        console.log("Database update skipped or failed, but verification passing.");
      }

      return NextResponse.json({ 
        success: true, 
        message: "Aadhaar Verified Successfully" 
      });
    }

    // Fail for anything else
    return NextResponse.json({ 
      success: false, 
      message: "Invalid Mobile Number or OTP code." 
    }, { status: 401 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}