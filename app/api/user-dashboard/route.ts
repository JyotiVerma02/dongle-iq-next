import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/app/lib/mongodb";
import { calculatePricing } from "@/app/lib/pricing";

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
    const pricing = calculatePricing({
      certType: body.certType,
      validity: body.validity,
      tokenType: body.tokenType,
      assistedService: body.assistedService,
    });

    await connectDB();
   await DashboardUser.findOneAndUpdate(
  { email: body.email },
  {
    ...body,
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
      message: "Error saving data",
    });
  }
}
