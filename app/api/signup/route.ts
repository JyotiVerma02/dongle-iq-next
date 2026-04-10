import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { transporter } from "@/app/lib/mailer";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { name, email, number, password } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedNumber = normalizeIndianMobile(number);

    if (!name || !normalizedEmail || !normalizedNumber || !password) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 }
      );
    }

    if (!isValidIndianMobile(normalizedNumber)) {
      return NextResponse.json(
        { message: "Enter a valid Indian mobile number" },
        { status: 400 }
      );
    }

    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const existingUserByNumber = await User.findOne({ number: normalizedNumber });
    if (existingUserByNumber) {
      return NextResponse.json(
        { message: "Mobile number already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      number: normalizedNumber,
      password: hashedPassword,
      otp,
      otpExpiry,
      isVerified: false,
    });

    await user.save();

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Verify Your Email",
      html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
      `,
    });

    return NextResponse.json({
      message: "OTP sent to your email",
    });
  } catch (error: unknown) {
    console.log(error);

    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      const duplicateError = error as { keyPattern?: Record<string, number> };
      if (duplicateError.keyPattern?.email) {
        return NextResponse.json({ message: "Email already registered" }, { status: 400 });
      }
      if (duplicateError.keyPattern?.number) {
        return NextResponse.json({ message: "Mobile number already exists" }, { status: 400 });
      }
    }

    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
