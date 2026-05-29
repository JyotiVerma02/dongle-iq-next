import { NextRequest, NextResponse } from "next/server";

import User from "@/models/user";
import Admin from "@/models/admin";
import { connectDB } from "@/lib/mongodb";
import { migrateLegacyAdminUser } from "@/lib/admin";
import { enforceRateLimit, getClientIp } from "@/lib/security";
import { ensureRedisConnected, redis } from "@/lib/redis";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `verify-otp:${ip}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many verification attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        },
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const { email, otp } = await req.json();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    const user = await User.findOne(
      { email: normalizedEmail },
      { _id: 1, isVerified: 1 },
    );
    const admin = user
      ? null
      : await Admin.findOne(
          { email: normalizedEmail },
          { _id: 1, isVerified: 1 },
        );
    const account = user || admin;

    if (!account) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (account.isVerified) {
      return NextResponse.json({ message: "Already verified" });
    }

    await ensureRedisConnected();
    const storedOtp = await redis.get(`otp:${normalizedEmail}`);

    if (!storedOtp) {
      return NextResponse.json({ message: "OTP expired" }, { status: 400 });
    }

    if (storedOtp !== normalizedOtp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    const accountModel = user ? User : Admin;
    await accountModel.updateOne(
      { _id: account._id },
      {
        $set: { isVerified: true },
      },
    );

    await redis.del(`otp:${normalizedEmail}`);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
