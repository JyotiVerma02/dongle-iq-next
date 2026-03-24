import { NextResponse } from "next/server";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    // 🔥 STRICT TEST BYPASS
    // Only allows your specific number and fixed OTP
    if (mobile === "7295014037" && otp === "123456") {
      
      await connectDB();

      // Update the user record in MongoDB
      // We set a specific flag for Aadhaar so you can track it separately
      await User.findOneAndUpdate(
        { number: mobile },
        { 
          isAadhaarVerified: true, 
          status: "approved", // Marking as approved for the dashboard
          updatedAt: new Date()
        },
        { upsert: true }
      );

      return NextResponse.json({ 
        success: true, 
        message: "Aadhaar Verified Successfully" 
      });
    }

    // Return error for any other combination
    return NextResponse.json(
      { success: false, message: "Invalid Mobile or OTP. " },
      { status: 401 }
    );

  } catch (error) {
    console.error("Aadhaar Route Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}