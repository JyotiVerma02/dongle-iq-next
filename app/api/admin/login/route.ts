import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const AdminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const Admin =
  mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

export async function POST(req: Request) {
  try {
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
    const token = jwt.sign(
      {
        userId: admin._id,
        role: "admin", // important
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1d" }
    );

    // 🔥 SET COOKIE
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
    });

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