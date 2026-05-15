import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import Admin from "@/model/admin";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { createAdminOtpEmail } from "@/app/lib/emailTemplates";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import { transporter } from "@/app/lib/mailer";
import { migrateLegacyAdminUser } from "@/app/lib/admin";
import { enforceRateLimit, generateNumericOtp, getClientIp, hashOtp, minutesFromNow } from "@/app/lib/security";

export async function GET() {
  try {
    await connectDB();
    await migrateLegacyAdminUser();

    const existingAdmin = await Admin.findOne().select("_id email isVerified");

    return NextResponse.json({
      success: true,
      exists: Boolean(existingAdmin),
      admin: existingAdmin
        ? {
            email: existingAdmin.email,
            isVerified: existingAdmin.isVerified,
          }
        : null,
    });
  } catch (error) {
    console.error("Admin Register Status Error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to check admin registration status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `admin-register:${ip}`,
      limit: 3,
      windowMs: 30 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many admin registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    await connectDB();
    await migrateLegacyAdminUser();

    const { name, email, number, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedNumber = normalizeIndianMobile(number);

    if (!name || !normalizedEmail || !normalizedNumber || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!isValidIndianMobile(normalizedNumber)) {
      return NextResponse.json({ error: "Enter a valid Indian mobile number" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

   const existingAdmin = await Admin.findOne();

if (existingAdmin) {
  return NextResponse.json(
    {
      error: "Admin already exists",
      email: existingAdmin.email,
    },
    { status: 409 }
  );
}

    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const existingUserByNumber = await User.findOne({ number: normalizedNumber });
    if (existingUserByNumber) {
      return NextResponse.json({ error: "Mobile number already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateNumericOtp();
    const otpExpiry = minutesFromNow(10);

    await Admin.create({
      name: String(name).trim(),
      email: normalizedEmail,
      number: normalizedNumber,
      password: hashedPassword,
      role: "admin",
      isVerified: false,
      status: "pending",
      otp: hashOtp(otp),
      otpExpiry,
    });

    const verificationEmail = createAdminOtpEmail({ otp, name });
    await transporter.sendMail({
      to: normalizedEmail,
      subject: verificationEmail.subject,
      text: verificationEmail.text,
      html: verificationEmail.html,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email. Verify to activate admin access.",
    });
  } catch (error: unknown) {
    console.error("Admin Register Error:", error);

    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const duplicateError = error as { keyPattern?: Record<string, number> };
      if (duplicateError.keyPattern?.email) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
      if (duplicateError.keyPattern?.number) {
        return NextResponse.json({ error: "Mobile number already exists" }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
