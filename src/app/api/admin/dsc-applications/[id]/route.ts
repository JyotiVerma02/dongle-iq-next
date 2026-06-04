import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { broadcastRealtimeEvent } from "@/app/api/realtime/route";
import { buildChanges, createAuditEntry, createLegacyActionHistoryEntry } from "@/lib/adminAudit";
import { resolveAdminActor } from "@/lib/admin";
import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import { getStatusPermission, validateStatusTransition } from "@/lib/applicationWorkflow";
import { createNotification } from "@/lib/createNotification";
import { connectDB } from "@/lib/mongodb";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
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

function getSaveErrorMessage(error: unknown) {
  if (error && typeof error === "object") {
    const err = error as {
      name?: string;
      code?: number;
      message?: string;
      keyPattern?: Record<string, unknown>;
      errors?: Record<string, { message?: string }>;
    };

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "value";
      return `${field} already exists`;
    }

    if (err.name === "ValidationError" && err.errors) {
      const firstError = Object.values(err.errors)[0];
      return firstError?.message || err.message || "Application validation failed";
    }

    if (err.message) {
      return err.message;
    }
  }

  return "Failed to update application";
}

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

    const adminUser = await resolveAdminActor(decoded.userId);
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

    const hasDetailUpdate =
      payload.name !== undefined ||
      payload.email !== undefined ||
      payload.mobile !== undefined ||
      payload.certificateClass !== undefined ||
      payload.certType !== undefined ||
      payload.validity !== undefined ||
      payload.tokenType !== undefined;

    if (hasDetailUpdate) {
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

      if (normalizedStatus === "rejected" && !String(payload.reason || "").trim()) {
        return NextResponse.json(
          { success: false, message: "Rejection reason is required" },
          { status: 400 }
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
    if (payload.status) {
      const notification = await createNotification({
        userId: String(user._id),
        title: "Application Status Updated",
        message:
          user.status === "approved"
            ? "Your application has been approved."
            : user.status === "rejected"
              ? "Your application needs attention before approval."
              : `Your application status is now ${user.status}.`,
        type: "status_update",
        metadata: {
          status: user.status,
          reason: payload.reason || "",
          updatedBy: actor.id,
        },
      });
    }
    broadcastRealtimeEvent("APPLICATION_UPDATED", {
      userId: String(user._id),
      applicationId: String(user._id),
      action: payload.status ? "status_changed" : "updated",
    });
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
        message: getSaveErrorMessage(error),
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

    const adminUser = await resolveAdminActor(decoded.userId);
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
