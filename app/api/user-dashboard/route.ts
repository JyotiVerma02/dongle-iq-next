import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { z } from "zod";

import { connectDB } from "@/app/lib/mongodb";
import { calculatePricing } from "@/app/lib/pricing";

const dashboardSchema = z.object({
  email: z.string().trim().email("A valid email is required"),
  certType: z.string().trim().min(1, "Certificate type is required"),
  validity: z.string().trim().min(1, "Validity is required"),
  tokenType: z.string().trim().min(1, "Token type is required"),
  assistedService: z.string().trim().optional().default(""),
}).passthrough();

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

const DashboardUser =
  mongoose.models.DashboardUser || mongoose.model("DashboardUser", UserSchema);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = dashboardSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid dashboard data",
      }, { status: 400 });
    }

    const payload = validation.data;
    const pricing = calculatePricing({
      certType: payload.certType,
      validity: payload.validity,
      tokenType: payload.tokenType,
      assistedService: payload.assistedService,
    });

    await connectDB();
    await DashboardUser.findOneAndUpdate(
      { email: payload.email },
      {
        ...payload,
        totalAmount: pricing.total,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Data saved successfully",
      totalAmount: pricing.total,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Unable to save dashboard data right now. Please try again.",
    }, { status: 500 });
  }
}
