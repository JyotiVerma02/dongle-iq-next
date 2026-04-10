import { NextRequest, NextResponse } from "next/server";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const { email, otp } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    const admin = user ? null : await Admin.findOne({ email: normalizedEmail });
    const account = user || admin;

    if (!account) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (account.isVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    if (String(account.otp) !== String(otp)) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    if (!account.otpExpiry || account.otpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    account.isVerified = true;
    account.otp = undefined;
    account.otpExpiry = undefined;
    await account.save();

    return NextResponse.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
