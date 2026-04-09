import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import User from "@/model/user";
import Admin from "@/model/admin";
import { connectDB } from "@/app/lib/mongodb";
import { migrateLegacyAdminUser } from "@/app/lib/admin";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const { token, password } = await req.json();

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    const admin = user
      ? null
      : await Admin.findOne({
          resetToken: token,
          resetTokenExpiry: { $gt: Date.now() },
        });

    const account = user || admin;

    if (!account) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    account.password = hashedPassword;
    account.resetToken = undefined;
    account.resetTokenExpiry = undefined;
    await account.save();

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
