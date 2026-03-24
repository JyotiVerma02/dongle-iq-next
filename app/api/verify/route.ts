import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { mobile, otp, type } = await req.json();

  console.log("Verification Type:", type);
  console.log("Mobile:", mobile);
  console.log("OTP:", otp);

  // 🔥 Dummy logic (later connect real API)
  if (otp === "123456") {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false });
}