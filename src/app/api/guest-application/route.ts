import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";

import { connectDB } from "@/lib/mongodb";
import { calculatePricing } from "@/lib/pricing";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { createAdminNotification } from "@/lib/notifications";
import { broadcastRealtimeEvent } from "@/lib/realtime";
import { ADMIN_REPORTS_CACHE_KEY, invalidateAdminUsersCache, invalidateCacheKey } from "@/lib/dashboardCache";
import User from "@/models/user";

const guestApplicationSchema = z.object({
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
}).strict();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = guestApplicationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid application payload",
        },
        { status: 400 },
      );
    }

    await connectDB();

    const payload = validation.data;
    const mobile = normalizeIndianMobile(payload.mobile);

    if (!isValidIndianMobile(mobile)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid Indian mobile number" },
        { status: 400 },
      );
    }

    const pricing = calculatePricing({
      certType: payload.certType,
      validity: payload.validity,
      tokenType: payload.tokenType,
      assistedService: payload.assistedService,
    });

    // For a guest, we check if mobile already exists for an active user.
    // If they already have an account, they should ideally log in.
    // But we'll allow creating a guest application if no conflict, or update an existing guest record.
    const existingUser = await User.findOne({
      number: mobile,
      role: { $ne: "admin" },
    });

    let targetUser = existingUser;

    if (!targetUser) {
      // Create a new guest user
      const randomPassword = crypto.randomBytes(16).toString("hex");
      
      targetUser = new User({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        number: mobile,
        password: randomPassword,
        role: "guest",
        createdBy: "client",
      });
    }

    targetUser.name = payload.name.trim();
    targetUser.email = payload.email.trim().toLowerCase();
    targetUser.certificateClass = payload.classType;
    targetUser.certType = payload.certType;
    targetUser.validity = payload.validity;
    targetUser.tokenType = payload.tokenType;
    targetUser.assistedService = payload.assistedService;
    targetUser.price = pricing.total;
    targetUser.status = "pending";
    targetUser.clientId = String(targetUser._id);
    targetUser.createdById = String(targetUser._id);

    try {
      await targetUser.save();
    } catch (saveError) {
      console.error("GUEST USER SAVE ERROR:", saveError);
      return NextResponse.json(
        { success: false, message: "Database save failed" },
        { status: 500 }
      );
    }

    await createAdminNotification({
      title: "New Guest DSC Application Submitted",
      message: `New Guest DSC application submitted by ${targetUser.name} (${targetUser.email}).`,
      type: "application",
      metadata: {
        userId: String(targetUser._id),
        certType: targetUser.certType,
        validity: targetUser.validity,
        createdBy: "guest",
      },
    });

    broadcastRealtimeEvent("APPLICATION_UPDATED", {
      userId: String(targetUser._id),
      applicationId: String(targetUser._id),
      action: "submitted",
    }, { recipientType: "ADMIN" });

    await invalidateAdminUsersCache();
    await invalidateCacheKey(ADMIN_REPORTS_CACHE_KEY);

    return NextResponse.json({
      success: true,
      message: "Guest Application created successfully",
      totalAmount: pricing.total,
      applicationId: targetUser._id,
    });
  } catch (error) {
    console.error("CREATE GUEST APPLICATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unable to create application right now." },
      { status: 500 },
    );
  }
}
