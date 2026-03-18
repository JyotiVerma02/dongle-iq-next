import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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

    return NextResponse.json({
      success: true,
      message: "Login successful",
    });

  } catch (error: any) {
    console.error("ADMIN LOGIN ERROR:", error.message);

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}