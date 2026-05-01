import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import User from "@/model/user";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("ADMIN APPLICATION DETAILS GET ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch application details" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = (await req.json()) as Record<string, unknown>;
    const userId = String(body.userId || "").trim();

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const nextEmail = String(body.email || "").trim().toLowerCase();
    const nextNumber = normalizeIndianMobile(body.number);

    if (!String(body.name || "").trim() || !nextEmail || !nextNumber) {
      return NextResponse.json(
        { success: false, message: "Name, email, and mobile are required" },
        { status: 400 },
      );
    }

    if (!isValidIndianMobile(nextNumber)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid Indian mobile number" },
        { status: 400 },
      );
    }

    const emailOwner = await User.findOne({
      email: nextEmail,
      role: { $ne: "admin" },
      _id: { $ne: user._id },
    });

    if (emailOwner) {
      return NextResponse.json(
        { success: false, message: "Email already exists" },
        { status: 400 },
      );
    }

    const numberOwner = await User.findOne({
      number: nextNumber,
      role: { $ne: "admin" },
      _id: { $ne: user._id },
    });

    if (numberOwner) {
      return NextResponse.json(
        { success: false, message: "Mobile number already exists" },
        { status: 400 },
      );
    }

    user.name = String(body.name || "").trim();
    user.email = nextEmail;
    user.number = nextNumber;
    user.gender = String(body.gender || "").trim();
    user.dob = String(body.dob || "").trim();
    user.pan = String(body.pan || "").trim().toUpperCase();
    user.ekycId = String(body.ekycId || "").trim();
    user.ekycPin = String(body.ekycPin || "").trim();
    user.bpCode = String(body.bpCode || "").trim();
    user.address = String(body.address || "").trim();
    user.pincode = String(body.pincode || "").trim();
    user.city = String(body.city || "").trim();
    user.state = String(body.state || "").trim();
    user.certificateClass = String(body.certificateClass || "").trim();
    user.certType = String(body.certType || "").trim();
    user.validity = String(body.validity || "").trim();
    user.tokenType = String(body.tokenType || "").trim();
    user.internalRemarks = String(body.internalRemarks || "").trim();

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      user,
    });
  } catch (error) {
    console.error("ADMIN APPLICATION DETAILS POST ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update application details" },
      { status: 500 },
    );
  }
}
