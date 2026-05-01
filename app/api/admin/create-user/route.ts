import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/app/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import User from "@/model/user";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const number = normalizeIndianMobile(body.number);

    if (!name || !email || !number) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and mobile number are required",
        },
        { status: 400 },
      );
    }

    if (!isValidIndianMobile(number)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid Indian mobile number",
        },
        { status: 400 },
      );
    }

    const existingUserByEmail = await User.findOne({
      email,
      role: { $ne: "admin" },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 400 },
      );
    }

    const existingUserByNumber = await User.findOne({
      number,
      role: { $ne: "admin" },
    });

    if (existingUserByNumber) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number already exists",
        },
        { status: 400 },
      );
    }

    const password = await bcrypt.hash("temp123", 10);

    const user = await User.create({
      name,
      email,
      number,
      password,
      role: "user",
      isVerified: false,
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        number: user.number,
        certificateClass: user.certificateClass || "",
        certType: user.certType || "",
        validity: user.validity || "",
        tokenType: user.tokenType || "",
      },
    });
  } catch (error) {
    console.error("ADMIN CREATE USER ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create user right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
