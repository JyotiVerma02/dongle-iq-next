import { NextResponse } from "next/server";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();
    const normalizedMobile = normalizeIndianMobile(mobile);

    if (!isValidIndianMobile(normalizedMobile)) {
      return NextResponse.json({
        success: false,
        message: "Invalid mobile number",
      }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    console.log("OTP for", normalizedMobile, "is:", otp);

    return NextResponse.json({
      success: true,
      message: "OTP generated (check server console)",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return NextResponse.json({
      success: false,
      message: "Server Error",
    }, { status: 500 });
  }
}
