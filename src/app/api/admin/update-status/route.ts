import { NextResponse } from "next/server";

import { broadcastRealtimeEvent } from "@/app/api/realtime/route";
import { buildChanges, createAuditEntry, createLegacyActionHistoryEntry } from "@/lib/adminAudit";
import { resolveAdminActor } from "@/lib/admin";
import { hasAdminPermission, normalizeAdminRole } from "@/lib/adminRoles";
import { validateStatusTransition, getStatusPermission } from "@/lib/applicationWorkflow";
import { ADMIN_REPORTS_CACHE_KEY, invalidateAdminUsersCache, invalidateUserDashboardCache, invalidateCacheKey } from "@/lib/dashboardCache";
import { connectDB } from "@/lib/mongodb";
import { sendStatusNotifications } from "@/lib/notifications";
import { adminOnly } from "@/lib/withAuth";
import type { AuthToken } from "@/lib/withAuth";
import User from "@/models/user";

const handler = async (req: Request, decoded: AuthToken) => {
  try {
    const { userId, status, internalRemarks, resubmissionDocs } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { success: false, message: "Missing data" },
        { status: 400 }
      );
    }

    const normalizedStatus = String(status).toLowerCase();
    const remarks = typeof internalRemarks === "string" ? internalRemarks.trim() : "";

    if (normalizedStatus === "rejected" && !remarks) {
      return NextResponse.json(
        { success: false, message: "Rejection reason is required" },
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
    if (!hasAdminPermission(adminRole, getStatusPermission(normalizedStatus))) {
      return NextResponse.json(
        { success: false, message: "You do not have permission for this workflow action" },
        { status: 403 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
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

    const previousState = {
      status: user.status,
      internalRemarks: user.internalRemarks,
      remarksViewed: user.remarksViewed,
      resubmissionDocs: user.resubmissionDocs?.toObject?.() || user.resubmissionDocs,
    };

    user.status = normalizedStatus;
    user.internalRemarks = remarks;
    user.remarksViewed = false;

    if (normalizedStatus === "rejected" && resubmissionDocs) {
      user.resubmissionDocs = {
        photo: !!resubmissionDocs.photo,
        idProof: !!resubmissionDocs.idProof,
        addressProof: !!resubmissionDocs.addressProof,
      };
    } else {
      user.resubmissionDocs = {
        photo: false,
        idProof: false,
        addressProof: false,
      };
    }

    const nextState = {
      status: user.status,
      internalRemarks: user.internalRemarks,
      remarksViewed: user.remarksViewed,
      resubmissionDocs: user.resubmissionDocs?.toObject?.() || user.resubmissionDocs,
    };

    const actor = {
      id: String(adminUser._id),
      name: adminUser.name,
      email: adminUser.email,
      role: adminRole,
    };

    const changes = buildChanges(previousState, nextState, [
      "status",
      "internalRemarks",
      "remarksViewed",
      "resubmissionDocs",
    ]);

    user.actionHistory.push(
      createLegacyActionHistoryEntry({
        action: "status_changed",
        actor,
        fromStatus: previousState.status,
        toStatus: normalizedStatus,
        remarks: remarks || `Application status moved to ${normalizedStatus}`,
      })
    );

    user.auditTrail.push(
      createAuditEntry({
        action: "status_changed",
        actor,
        changes,
        fromStatus: previousState.status,
        toStatus: normalizedStatus,
        remarks,
      })
    );

    if (previousState.status !== normalizedStatus) {
      user.statusHistory.push({
        fromStatus: previousState.status,
        toStatus: normalizedStatus,
        changedById: actor.id,
        changedByName: actor.name,
        changedByEmail: actor.email,
        changedByRole: adminRole,
        remarks,
        changedAt: new Date(),
      });
    }

    await user.save();

    await sendStatusNotifications({
      mobileNumber: user.number,
      name: user.name,
      status: normalizedStatus,
      remarks,
    });

    broadcastRealtimeEvent("STATUS_UPDATE", { userId: user._id.toString() });
    await invalidateUserDashboardCache(user._id.toString());
    await invalidateAdminUsersCache();
    await invalidateCacheKey(ADMIN_REPORTS_CACHE_KEY);

    return NextResponse.json({
      success: true,
      message: "Status updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};

export const POST = adminOnly(handler);
