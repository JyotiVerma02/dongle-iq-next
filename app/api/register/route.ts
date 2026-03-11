import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";
import { registerSchema } from "@/schemas/registerSchema";
import { transporter } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.flatten().fieldErrors;
      const message = Object.values(firstError).flat()[0];
      return NextResponse.json({ message }, { status: 400 });
    }

    const { name, email, password, number } = parsed.data;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "user";

    if (body.role === "admin") {
      if (body.adminKey !== process.env.ADMIN_SECRET_KEY) {
        return NextResponse.json(
          { message: "Invalid Admin Secret Key" },
          { status: 400 }
        );
      }
      role = "admin";
    }

    // 🔥 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 🔥 Create user with OTP
    await User.create({
      name,
      email,
      password: hashedPassword,
      number: number ?? undefined,
      role,
      otp,
      otpExpiry,
    });

    // 🔥 Send OTP Email
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

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}