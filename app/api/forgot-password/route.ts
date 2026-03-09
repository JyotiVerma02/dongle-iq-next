import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { transporter } from "@/app/lib/mailer";
import User from "@/model/user";
import { connectDB } from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { email } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Email not registered" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

   user.resetToken = token;
user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await user.save();

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"DongleIQ Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Password",
      html: `
        <h2>Password Reset</h2>
        <p>Click below to reset your password</p>

        <a href="${resetLink}"
        style="background:#16a34a;color:white;padding:10px 20px;text-decoration:none;border-radius:6px;">
        Reset Password
        </a>

        <p>This link expires in 1 hour</p>
      `,
    });

    return NextResponse.json({
      message: "Reset link sent to your email",
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Error sending email" },
      { status: 500 }
    );
  }
}