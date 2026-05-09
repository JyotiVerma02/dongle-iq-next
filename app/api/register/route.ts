import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { registerSchema } from "@/schemas/registerSchema";
import { transporter } from "@/app/lib/mailer";
import { normalizeIndianMobile } from "@/app/lib/phone";
import { enforceRateLimit, generateNumericOtp, getClientIp, hashOtp, minutesFromNow } from "@/app/lib/security";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `register:${ip}`,
      limit: 5,
      windowMs: 30 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { message: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    await connectDB();

    const body = await req.json();
    const normalizedBody = {
      ...body,
      email: String(body.email || "").trim().toLowerCase(),
      number: normalizeIndianMobile(body.number),
    };

    const parsed = registerSchema.safeParse(normalizedBody);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const message = Object.values(firstError).flat()[0];
      return NextResponse.json({ message }, { status: 400 });
    }

    const { name, email, password, number } = parsed.data;

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const existingUserByNumber = await User.findOne({ number });
    if (existingUserByNumber) {
      return NextResponse.json(
        { message: "Mobile number already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "user";

    if (body.role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return NextResponse.json(
          { message: "Admin already exists" },
          { status: 400 }
        );
      }

      if (body.adminKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { message: "Invalid Admin Secret Key" },
          { status: 400 }
        );
      }
      role = "admin";
    }

    const otp = generateNumericOtp();
    const otpExpiry = minutesFromNow(10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      number,
      role,
      otp: hashOtp(otp),
      otpExpiry,
    });

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email",
      html: `
        <h2>Email Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    return NextResponse.json(
      { message: "Registration successful. OTP sent to email." },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error(error);

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
