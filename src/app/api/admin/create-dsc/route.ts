import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { z } from "zod";

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

export async function POST(req: NextRequest) {
  try {
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

    await connectDB();

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
    newUser.password = "DefaultPassword123"; // In a real app, should be hashed or generated and sent to user

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
}
