/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    // 🔥 STRICT CHECK: Only allow your specific number
    if (mobile === "7295014037") {
      return NextResponse.json({ 
        success: true, 
        message: "OTP sent! (Hint: Use 123456)" 
      });
    }

    // Fail for any other number
    return NextResponse.json({ 
      success: false, 
      message: "This number is not authorized for testing." 
    }, { status: 403 });

  } catch (error) {
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}