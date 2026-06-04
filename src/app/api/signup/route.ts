import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "@/models/user";
import { connectDB } from "@/lib/mongodb";
import { createUserOtpEmail } from "@/lib/emailTemplates";
import { createAdminNotification } from "@/lib/notifications";
import { transporter } from "@/lib/mailer";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import {
  enforceRateLimit,
  generateNumericOtp,
  getClientIp,
} from "@/lib/security";
import { ensureRedisConnected, redis } from "@/lib/redis";

const signupSchema = z.object({
  name: z.string().trim().min(3, "Name must be at least 3 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  number: z.string().trim().min(10, "Please enter a valid mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `signup:${ip}`,
      limit: 5,
      windowMs: 30 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)),
          },
        },
      );
    }

    await connectDB();

    const body = await req.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message:
            validation.error.issues[0]?.message || "All fields are required",
        },
        { status: 400 },
      );
    }

    const { name, email, number, password } = validation.data;
    const normalizedEmail = email.toLowerCase();
    const normalizedNumber = normalizeIndianMobile(number);

    if (!isValidIndianMobile(normalizedNumber)) {
      return NextResponse.json(
        { message: "Enter a valid Indian mobile number" },
        { status: 400 },
      );
    }

    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 },
      );
    }

    const existingUserByNumber = await User.findOne({
      number: normalizedNumber,
    });
    if (existingUserByNumber) {
      return NextResponse.json(
        { message: "Mobile number already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateNumericOtp();
    await ensureRedisConnected();
    await redis.set(`otp:${normalizedEmail}`, otp.toString(), { EX: 300 });

    const user = new User({
      name: String(name).trim(),
      email: normalizedEmail,
      number: normalizedNumber,
      password: hashedPassword,
      isVerified: false,
    });

    await user.save();

    await createAdminNotification({
      title: "New User Registered",
      message: `${String(name).trim()} (${normalizedEmail}) created a new account.`,
      type: "user",
      metadata: {
        userId: String(user._id),
        email: normalizedEmail,
        number: normalizedNumber,
        source: "signup",
      },
    });

    const verificationEmail = createUserOtpEmail({ otp, name });
    await transporter.sendMail({
      to: normalizedEmail,
      subject: verificationEmail.subject,
      text: verificationEmail.text,
      html: verificationEmail.html,
    });

    return NextResponse.json({
      message: "OTP sent to your email",
    });
  } catch (error: unknown) {
    console.log(error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const duplicateError = error as { keyPattern?: Record<string, number> };
      if (duplicateError.keyPattern?.email) {
        return NextResponse.json(
          { message: "Email already registered" },
          { status: 400 },
        );
      }
      if (duplicateError.keyPattern?.number) {
        return NextResponse.json(
          { message: "Mobile number already exists" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json(
      { message: "Unable to create account right now. Please try again." },
      { status: 500 },
    );
  }
}
