import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { buildChanges, createAuditEntry, createLegacyActionHistoryEntry } from "@/lib/adminAudit";
import { resolveAdminActor } from "@/lib/admin";
import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import { validateStatusTransition } from "@/lib/applicationWorkflow";
import { connectDB } from "@/lib/mongodb";
import { calculatePricing } from "@/lib/pricing";
import { hashField } from "@/lib/encryption";
import { isValidIndianMobile, normalizeIndianMobile } from "@/lib/phone";
import { ADMIN_REPORTS_CACHE_KEY, invalidateAdminUsersCache, invalidateUserDashboardCache, invalidateCacheKey } from "@/lib/dashboardCache";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import User from "@/models/user";

const VALID_STATUSES = new Set(["pending", "approved", "rejected", "dispatched", "delivered", "issued"]);

function createDscId() {
  const year = new Date().getFullYear();
  const suffix = Math.floor(10000 + Math.random() * 90000);
  return `DIQ-${year}-${suffix}`;
}

const getHandler = async (req: NextRequest) => {
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
};

const postHandler = async (req: NextRequest, decoded: AuthToken) => {
  try {
    await connectDB();

    const admin = await resolveAdminActor(decoded.userId);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 },
      );
    }

    const adminRole = normalizeAdminRole(admin.role);
    if (!hasAdminPermission(adminRole, "manage_application_details")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to manage application details" },
        { status: 403 },
      );
    }

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

    const actor = {
      id: String(admin._id),
      name: admin.name,
      email: admin.email,
      role: adminRole,
    };

    let user = null;
    let previousState: Record<string, unknown> | null = null;

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

      previousState = {
        name: user.name,
        email: user.email,
        number: user.number,
        dscId: user.dscId,
        pan: user.pan,
        address: user.address,
        pincode: user.pincode,
        city: user.city,
        state: user.state,
        certificateClass: user.certificateClass,
        certType: user.certType,
        validity: user.validity,
        tokenType: user.tokenType,
        assistedService: user.assistedService,
        internalRemarks: user.internalRemarks,
        price: user.price,
        status: user.status,
      };
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
        createdById: actor.id,
        isVerified: false,
        isAadhaarVerified: false,
        status: "pending",
      });
      previousState = {
        name: null,
        email: null,
        number: null,
        dscId: null,
        pan: null,
        address: null,
        pincode: null,
        city: null,
        state: null,
        certificateClass: null,
        certType: null,
        validity: null,
        tokenType: null,
        assistedService: null,
        internalRemarks: null,
        price: null,
        status: null,
      };
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

    const workflowValidation = validateStatusTransition(user.toObject(), nextStatus);
    if (!workflowValidation.ok) {
      return NextResponse.json(
        {
          success: false,
          message: workflowValidation.message,
          missingFields: workflowValidation.missingFields || [],
        },
        { status: 400 },
      );
    }

    user.status = nextStatus;

    const nextSnapshot = {
      name: user.name,
      email: user.email,
      number: user.number,
      dscId: user.dscId,
      pan: user.pan,
      address: user.address,
      pincode: user.pincode,
      city: user.city,
      state: user.state,
      certificateClass: user.certificateClass,
      certType: user.certType,
      validity: user.validity,
      tokenType: user.tokenType,
      assistedService: user.assistedService,
      internalRemarks: user.internalRemarks,
      price: user.price,
      status: user.status,
    };

    const changes = buildChanges(previousState || {}, nextSnapshot, [
      "name",
      "email",
      "number",
      "dscId",
      "pan",
      "address",
      "pincode",
      "city",
      "state",
      "certificateClass",
      "certType",
      "validity",
      "tokenType",
      "assistedService",
      "internalRemarks",
      "price",
      "status",
    ]);

    user.actionHistory.push(
      createLegacyActionHistoryEntry({
        action: userId ? "application_updated" : "application_created",
        actor,
        fromStatus: typeof previousState?.status === "string" ? String(previousState.status) : undefined,
        toStatus: user.status,
        remarks: userId ? "Application details updated" : "Application created by admin",
      }),
    );
    user.auditTrail.push(
      createAuditEntry({
        action: userId ? "application_updated" : "application_created",
        actor,
        changes,
        fromStatus: typeof previousState?.status === "string" ? String(previousState.status) : undefined,
        toStatus: user.status,
        remarks: String(body.internalRemarks || "").trim() || undefined,
      }),
    );
    if (previousState?.status !== user.status) {
      user.statusHistory.push({
        fromStatus: typeof previousState?.status === "string" ? String(previousState.status) : "pending",
        toStatus: user.status,
        changedById: actor.id,
        changedByName: actor.name,
        changedByEmail: actor.email,
        changedByRole: adminRole,
        remarks: String(body.internalRemarks || "").trim(),
        changedAt: new Date(),
      });
    }

    await user.save();
    await invalidateUserDashboardCache(String(user._id));
    await invalidateAdminUsersCache();
    await invalidateCacheKey(ADMIN_REPORTS_CACHE_KEY);

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
};

export const GET = adminOnly(getHandler);
export const POST = adminOnly(postHandler);
