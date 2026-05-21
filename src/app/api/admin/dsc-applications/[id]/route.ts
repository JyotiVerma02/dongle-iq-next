import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { broadcastRealtimeEvent } from "@/app/api/realtime/route";
import { buildChanges, createAuditEntry, createLegacyActionHistoryEntry } from "@/lib/adminAudit";
import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import { getStatusPermission, validateStatusTransition } from "@/lib/applicationWorkflow";
import { connectDB } from "@/lib/mongodb";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import Admin from "@/models/admin";
import User from "@/models/user";

const updateDscSchema = z.object({
  name: z.string().trim().optional(),
  email: z.string().trim().email().optional(),
  mobile: z.string().trim().optional(),
  certificateClass: z.string().optional(),
  certType: z.string().optional(),
  validity: z.string().optional(),
  tokenType: z.string().optional(),
  status: z.string().optional(),
  reason: z.string().optional(),
  resubmissionDocs: z.object({
    photo: z.boolean().optional(),
    idProof: z.boolean().optional(),
    addressProof: z.boolean().optional(),
  }).optional(),
}).strict();

const putHandler = async (
  req: NextRequest,
  decoded: AuthToken,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateDscSchema.safeParse(body);

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

    const adminUser = await Admin.findById(decoded.userId).select("name email role");
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    const adminRole = normalizeAdminRole(adminUser.role);
    const payload = validation.data;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    const previousState = {
      name: user.name,
      email: user.email,
      number: user.number,
      certificateClass: user.certificateClass,
      certType: user.certType,
      validity: user.validity,
      tokenType: user.tokenType,
      status: user.status,
      internalRemarks: user.internalRemarks,
      remarksViewed: user.remarksViewed,
      resubmissionDocs: user.resubmissionDocs?.toObject?.() || user.resubmissionDocs,
    };

    if (payload.name || payload.email || payload.mobile || payload.certificateClass || payload.certType || payload.validity || payload.tokenType) {
      if (!hasAdminPermission(adminRole, "manage_application_details")) {
        return NextResponse.json(
          { success: false, message: "You do not have permission to edit applicant details" },
          { status: 403 }
        );
      }
    }

    if (payload.name) user.name = payload.name;
    if (payload.email) user.email = payload.email.toLowerCase();
    if (payload.mobile) user.number = payload.mobile;
    if (payload.certificateClass) user.certificateClass = payload.certificateClass;
    if (payload.certType) user.certType = payload.certType;
    if (payload.validity) user.validity = payload.validity;
    if (payload.tokenType) user.tokenType = payload.tokenType;

    if (payload.status) {
      const normalizedStatus = payload.status.toLowerCase();
      if (!hasAdminPermission(adminRole, getStatusPermission(normalizedStatus))) {
        return NextResponse.json(
          { success: false, message: "You do not have permission for this workflow action" },
          { status: 403 }
        );
      }

      const workflowValidation = validateStatusTransition(user.toObject(), normalizedStatus);
      if (!workflowValidation.ok) {
        return NextResponse.json(
          {
            success: false,
            message: workflowValidation.message,
            missingFields: workflowValidation.missingFields || [],
          },
          { status: 400 }
        );
      }

      user.status = normalizedStatus;
      user.remarksViewed = false;
      user.internalRemarks = payload.reason || "";

      if (normalizedStatus === "rejected" && payload.resubmissionDocs) {
        user.resubmissionDocs = {
          photo: !!payload.resubmissionDocs.photo,
          idProof: !!payload.resubmissionDocs.idProof,
          addressProof: !!payload.resubmissionDocs.addressProof,
        };
      } else {
        user.resubmissionDocs = {
          photo: false,
          idProof: false,
          addressProof: false,
        };
      }
    } else if (payload.reason !== undefined) {
      if (!hasAdminPermission(adminRole, "leave_internal_note")) {
        return NextResponse.json(
          { success: false, message: "You do not have permission to add internal notes" },
          { status: 403 }
        );
      }
      user.internalRemarks = payload.reason;
    }

    const actor = {
      id: String(adminUser._id),
      name: adminUser.name,
      email: adminUser.email,
      role: adminRole,
    };

    const nextState = {
      name: user.name,
      email: user.email,
      number: user.number,
      certificateClass: user.certificateClass,
      certType: user.certType,
      validity: user.validity,
      tokenType: user.tokenType,
      status: user.status,
      internalRemarks: user.internalRemarks,
      remarksViewed: user.remarksViewed,
      resubmissionDocs: user.resubmissionDocs?.toObject?.() || user.resubmissionDocs,
    };

    const changes = buildChanges(previousState, nextState, [
      "name",
      "email",
      "number",
      "certificateClass",
      "certType",
      "validity",
      "tokenType",
      "status",
      "internalRemarks",
      "remarksViewed",
      "resubmissionDocs",
    ]);

    user.actionHistory.push(
      createLegacyActionHistoryEntry({
        action: payload.status ? "status_changed" : "application_updated",
        actor,
        fromStatus: previousState.status,
        toStatus: user.status,
        remarks: payload.reason || "Application details updated",
      })
    );
    user.auditTrail.push(
      createAuditEntry({
        action: payload.status ? "status_changed" : "application_updated",
        actor,
        changes,
        fromStatus: previousState.status,
        toStatus: user.status,
        remarks: payload.reason,
      })
    );

    if (payload.status && previousState.status !== user.status) {
      user.statusHistory.push({
        fromStatus: previousState.status,
        toStatus: user.status,
        changedById: actor.id,
        changedByName: actor.name,
        changedByEmail: actor.email,
        changedByRole: adminRole,
        remarks: payload.reason || "",
        changedAt: new Date(),
      });
    }

    await user.save();
    broadcastRealtimeEvent("STATUS_UPDATE", { userId: id });

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: user,
    });
  } catch (error) {
    console.error("UPDATE DSC ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update application",
      },
      { status: 500 }
    );
  }
};

const deleteHandler = async (
  _req: NextRequest,
  decoded: AuthToken,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    await connectDB();

    const adminUser = await Admin.findById(decoded.userId).select("name email role");
    if (!adminUser) {
      return NextResponse.json(
        { success: false, message: "Admin not found" },
        { status: 404 }
      );
    }

    const adminRole = normalizeAdminRole(adminUser.role);
    if (!hasAdminPermission(adminRole, "delete_application")) {
      return NextResponse.json(
        { success: false, message: "You do not have permission to delete applications" },
        { status: 403 }
      );
    }

    const deletedUser = await User.findById(id);

    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    deletedUser.auditTrail.push(
      createAuditEntry({
        action: "application_deleted",
        actor: {
          id: String(adminUser._id),
          name: adminUser.name,
          email: adminUser.email,
          role: adminRole,
        },
        changes: [
          {
            field: "deleted",
            previousValue: false,
            newValue: true,
          },
        ],
        remarks: "Application deleted by admin",
      })
    );
    await deletedUser.save();
    await User.deleteOne({ _id: deletedUser._id });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("DELETE DSC ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete application",
      },
      { status: 500 }
    );
  }
};

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = adminOnly((innerReq, decoded) => putHandler(innerReq, decoded, context));
  return handler(req);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const handler = adminOnly((innerReq, decoded) => deleteHandler(innerReq, decoded, context));
  return handler(req);
}
