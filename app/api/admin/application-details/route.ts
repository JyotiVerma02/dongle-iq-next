import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { connectDB } from "@/app/lib/mongodb";
import { calculatePricing } from "@/app/lib/pricing";
import { hashField } from "@/app/lib/encryption";
import { isValidIndianMobile, normalizeIndianMobile } from "@/app/lib/phone";
import User from "@/model/user";

const VALID_STATUSES = new Set(["pending", "approved", "rejected", "issued"]);

function createDscId() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `DIQ-${year}-${suffix}`;
}

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

    const nextEmail = String(body.email || "").trim().toLowerCase();
    const nextNumber = normalizeIndianMobile(body.number);
    const nextName = String(body.name || "").trim();
    const nextPan = String(body.pan || "").trim().toUpperCase();
    const nextAddress = String(body.address || "").trim();
    const nextPincode = String(body.pincode || "").trim();
    const nextCity = String(body.city || "").trim();
    const nextState = String(body.state || "").trim();
    const nextBpCode = String(body.bpCode || "").trim();
    const nextCertificateClass = String(body.certificateClass || "").trim();
    const nextCertType = String(body.certType || "").trim();
    const nextValidity = String(body.validity || "").trim();
    const nextTokenType = String(body.tokenType || "").trim() || "Not Required";
    const nextAssistedService =
      String(body.assistedService || "Not Required").trim() || "Not Required";
    const requestedStatus = String(body.status || "pending").trim().toLowerCase();
    const nextStatus = VALID_STATUSES.has(requestedStatus) ? requestedStatus : "pending";
    const requestedDscId = String(body.dscId || "").trim().toUpperCase();

    if (
      !nextName ||
      !nextEmail ||
      !nextNumber ||
      !nextPan ||
      !nextAddress ||
      !nextPincode ||
      !nextCity ||
      !nextState ||
      !nextCertificateClass ||
      !nextCertType ||
      !nextValidity ||
      !nextTokenType
    ) {
      return NextResponse.json(
        { success: false, message: "Fill all required applicant and DSC fields" },
        { status: 400 },
      );
    }

    if (!isValidIndianMobile(nextNumber)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid Indian mobile number" },
        { status: 400 },
      );
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(nextPan)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid PAN number" },
        { status: 400 },
      );
    }

    if (!/^[0-9]{6}$/.test(nextPincode)) {
      return NextResponse.json(
        { success: false, message: "Enter a valid 6 digit pincode" },
        { status: 400 },
      );
    }

    let user = null;

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json(
          { success: false, message: "Invalid userId" },
          { status: 400 },
        );
      }

      user = await User.findById(userId);

      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 },
        );
      }
    }

    const emailOwner = await User.findOne({
      email: nextEmail,
      role: { $ne: "admin" },
      ...(user ? { _id: { $ne: user._id } } : {}),
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
      ...(user ? { _id: { $ne: user._id } } : {}),
    });

    if (numberOwner) {
      return NextResponse.json(
        { success: false, message: "Mobile number already exists" },
        { status: 400 },
      );
    }

    const panOwner = await User.findOne({
      panHash: hashField(nextPan),
      role: { $ne: "admin" },
      ...(user ? { _id: { $ne: user._id } } : {}),
    });

    if (panOwner) {
      return NextResponse.json(
        { success: false, message: "PAN already exists" },
        { status: 400 },
      );
    }

    const nextPrice = calculatePricing({
      certType: nextCertType,
      validity: nextValidity,
      tokenType: nextTokenType,
      assistedService: nextAssistedService,
    }).total;

    const nextDscId = requestedDscId || user?.dscId || createDscId();

    const dscIdOwner = await User.findOne({
      dscId: nextDscId,
      role: { $ne: "admin" },
      ...(user ? { _id: { $ne: user._id } } : {}),
    });

    if (dscIdOwner) {
      return NextResponse.json(
        { success: false, message: "DSC ID already exists. Try again." },
        { status: 400 },
      );
    }

    if (!user) {
      const password = await bcrypt.hash("temp123", 10);

      user = new User({
        password,
        role: "user",
        createdBy: "admin",
        createdById: "admin-panel",
        isVerified: false,
        isAadhaarVerified: false,
        status: "pending",
      });
    }

    user.name = nextName;
    user.email = nextEmail;
    user.number = nextNumber;
    user.dscId = nextDscId;
    user.gender = String(body.gender || "").trim();
    user.dob = String(body.dob || "").trim();
    user.pan = nextPan;
    user.ekycId = String(body.ekycId || "").trim();
    user.ekycPin = String(body.ekycPin || "").trim();
    user.bpCode = nextBpCode;
    user.address = nextAddress;
    user.pincode = nextPincode;
    user.city = nextCity;
    user.state = nextState;
    user.certificateClass = nextCertificateClass;
    user.certType = nextCertType;
    user.validity = nextValidity;
    user.tokenType = nextTokenType;
    user.assistedService = nextAssistedService;
    user.internalRemarks = String(body.internalRemarks || "").trim();
    user.price = nextPrice;
    user.clientId = user.clientId || String(user._id);
    user.status = nextStatus;

    await user.save();

    return NextResponse.json({
      success: true,
      message: userId ? "Application updated successfully" : "Applicant and DSC application created successfully",
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
