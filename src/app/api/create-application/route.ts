import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/lib/mongodb";
import { calculatePricing } from "@/lib/pricing";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import User from "@/models/user";
import { verifyAuthToken } from "@/lib/auth";

const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  mobile: z.string().trim().min(10, "Valid mobile number is required"),
  userType: z.string().trim().optional(),
  classType: z.string().trim().min(1, "Certificate class is required"),
  certType: z.string().trim().min(1, "Service type is required"),
  validity: z.string().trim().min(1, "Validity is required"),
  tokenType: z.string().trim().min(1, "Token type is required"),
  assistedService: z.string().trim().optional().default("Not Required"),
  ekycType: z.string().trim().optional(),
  totalAmount: z.number().optional(),
  isAdmin: z.boolean().optional().default(false),
  clientId: z.string().trim().optional(),
}).strict();

type DecodedToken = {
  userId: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = applicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            validation.error.issues[0]?.message || "Invalid application payload",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const payload = validation.data;
    const mobile = normalizeIndianMobile(payload.mobile);

    if (!isValidIndianMobile(mobile)) {
      return NextResponse.json(
        {
          success: false,
          message: "Enter a valid Indian mobile number",
        },
        { status: 400 },
      );
    }

    const pricing = calculatePricing({
      certType: payload.certType,
      validity: payload.validity,
      tokenType: payload.tokenType,
      assistedService: payload.assistedService,
    });

    let targetUserId = payload.clientId;
    let createdById = payload.isAdmin ? "admin-panel" : "";

    if (!payload.isAdmin) {
      const token = req.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 },
        );
      }

      const decoded = verifyAuthToken(token) as DecodedToken;
      console.log("DEBUG CREATE_APPLICATION:", {
        decoded,
        tokenExisted: !!token,
        isAdminPayload: payload.isAdmin
      });

      targetUserId = decoded.userId;
      createdById = decoded.userId;
    }

    if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
      console.log("DEBUG: Invalid or missing targetUserId:", targetUserId);
      return NextResponse.json(
        {
          success: false,
          message: "A valid client must be selected",
        },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({
      _id: targetUserId,
      role: { $ne: "admin" },
    });

    if (!existingUser) {
      console.log("DEBUG: existingUser is null for targetUserId:", targetUserId);
      return NextResponse.json(
        {
          success: false,
          message: "Client not found",
        },
        { status: 404 },
      );
    }

    const emailOwner = await User.findOne({
      email: payload.email.trim().toLowerCase(),
      role: { $ne: "admin" },
      _id: { $ne: existingUser._id },
    });

    if (emailOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "Email already exists",
        },
        { status: 400 },
      );
    }

    const mobileOwner = await User.findOne({
      number: mobile,
      role: { $ne: "admin" },
      _id: { $ne: existingUser._id },
    });

    if (mobileOwner) {
      return NextResponse.json(
        {
          success: false,
          message: "Mobile number already exists",
        },
        { status: 400 },
      );
    }

    existingUser.name = payload.name.trim();
    existingUser.email = payload.email.trim().toLowerCase();
    existingUser.number = mobile;
    existingUser.certificateClass = payload.classType;
    existingUser.certType = payload.certType;
    existingUser.validity = payload.validity;
    existingUser.tokenType = payload.tokenType;
    existingUser.assistedService = payload.assistedService;
    existingUser.price = pricing.total;
    existingUser.status = "pending";
    existingUser.createdBy = payload.isAdmin ? "admin" : "client";
    existingUser.createdById = createdById;
    existingUser.clientId = String(existingUser._id);

try {
  await existingUser.save();
} catch (saveError) {
  console.error("USER SAVE ERROR:", saveError);

  return NextResponse.json(
    {
      success: false,
      message: "Database save failed",
      error:
        saveError instanceof Error
          ? saveError.message
          : "Unknown save error",
    },
    { status: 500 }
  );
}
    return NextResponse.json({
      success: true,
      message: "Application created successfully",
      totalAmount: pricing.total,
      createdBy: existingUser.createdBy,
    });
  } catch (error) {
    console.error("CREATE APPLICATION ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create application right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
// 👇 ADD THIS BELOW POST

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        name: user.name,
        email: user.email,
        mobile: user.number,
        classType: user.certificateClass,
        certType: user.certType,
        validity: user.validity,
        tokenType: user.tokenType,
      },
    });
  } catch (error) {
    console.error("GET APPLICATION ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
