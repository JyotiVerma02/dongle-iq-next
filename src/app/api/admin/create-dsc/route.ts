import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import { connectDB } from "@/lib/mongodb";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import Admin from "@/models/admin";

const createDscSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required"),
  mobile: z.string().trim().min(10, "Valid mobile number is required"),
  classType: z.string().optional(),
  certType: z.string().optional(),
  validity: z.string().optional(),
  tokenType: z.string().optional(),
  assistedService: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  bankName: z.string().optional(),
  operator: z.string().optional(),
  circle: z.string().optional(),
}).strict();

const handler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const admin = await Admin.findById(decoded.userId).select("role");
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Admin not found",
        },
        { status: 404 }
      );
    }

    if (!hasAdminPermission(normalizeAdminRole(admin.role), "manage_application_details")) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to create DSC applications",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createDscSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error.issues[0]?.message || "Invalid payload",
        },
        { status: 400 }
      );
    }
    const payload = validation.data;

    // Check if user already exists with email or mobile
    const existingUser = await User.findOne({
      $or: [
        { email: payload.email.toLowerCase() },
        { number: payload.mobile }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "A user with this email or mobile already exists.",
        },
        { status: 400 }
      );
    }

    // Generate unique DSC ID
    const dscId = `DSC-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000)}`;

    // Create new user/application
    const newUser = new User({
      name: payload.name,
      email: payload.email.toLowerCase(),
      number: payload.mobile,
      role: "user",
      serviceType: "dsc",
      status: "pending",
      dscId: dscId,
      certificateClass: payload.classType,
      certType: payload.certType,
      validity: payload.validity,
      tokenType: payload.tokenType,
      assistedService: payload.assistedService,
      // We can store bank and telecom details in internalRemarks or extend schema
      // For now, let's put them in internalRemarks as JSON or just ignore if not in schema
      internalRemarks: JSON.stringify({
        bankDetails: {
          accountNumber: payload.accountNumber,
          ifscCode: payload.ifscCode,
          bankName: payload.bankName,
        },
        telecomDetails: {
          operator: payload.operator,
          circle: payload.circle,
        }
      })
    });

    // Password is required in schema?
    // Let's check UserSchema in user.ts
    // Line 33: password: { type: String, required: true }
    // Ah! Password is required!
    // I need to generate a random password or set a default one since the admin is creating it.
    // Let's set a default password or generate one.
    newUser.password = await bcrypt.hash("DefaultPassword123!", 10);

    await newUser.save();

    return NextResponse.json({
      success: true,
      message: "DSC Application created successfully",
      dscId: dscId,
    });
  } catch (error) {
    console.error("CREATE DSC ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create DSC application",
      },
      { status: 500 }
    );
  }
};

export const POST = adminOnly(handler);
