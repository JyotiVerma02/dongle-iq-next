import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import User from "@/models/user";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query parameter is required" },
        { status: 400 }
      );
    }

    let user = null;

    // Check if query is a valid MongoDB ObjectId (Application ID)
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findById(query).select("name email number certificateClass certType validity status");
    }

    // If not found by ID, try searching by Mobile Number
    if (!user) {
      const mobile = normalizeIndianMobile(query);
      if (isValidIndianMobile(mobile)) {
        user = await User.findOne({ number: mobile, role: { $ne: "admin" } }).select("name email number certificateClass certType validity status");
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.number,
        classType: user.certificateClass,
        certType: user.certType,
        validity: user.validity,
        status: user.status || "pending",
      },
    });
  } catch (error) {
    console.error("TRACK APPLICATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to track application" },
      { status: 500 }
    );
  }
}
