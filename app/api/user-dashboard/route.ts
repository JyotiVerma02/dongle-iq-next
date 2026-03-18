import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongodb";
import mongoose from "mongoose";

// ✅ Create Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  mobile: String,
  userType: String,
  classType: String,
  certType: String,
  validity: String,
  tokenType: String,
  assistedService: String,
  ekycType: String,
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent model overwrite error
const DashboardUser =
  mongoose.models.DashboardUser || mongoose.model("DashboardUser", UserSchema);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await connectDB(); // just connect
    await DashboardUser.create(body); // ✅ mongoose way

    return NextResponse.json({
      success: true,
      message: "Data saved successfully",
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Error saving data",
    });
  }
}
