import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { setAuthCookie, signAuthToken } from "@/lib/auth";
import { enforceRateLimit, getClientIp } from "@/lib/security";

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Admin =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limiter = enforceRateLimit({
      key: `admin-login:${ip}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });

    if (!limiter.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limiter.retryAfterMs / 1000)) } }
      );
    }

    const { email, password } = await req.json();

    await connectDB();

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Wrong password" },
        { status: 403 }
      );
    }

    // 🔥 CREATE TOKEN
    const token = signAuthToken(
      {
        userId: String(admin._id),
        role: "admin",
      },
      "1h"
    );

    // 🔥 SET COOKIE
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    setAuthCookie(response, token, false);

    return response;

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown server error";
    console.error("ADMIN LOGIN ERROR:", message);

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
