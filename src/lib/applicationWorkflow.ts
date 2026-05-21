import { hasAdminPermission, type AdminRole } from "@/lib/adminRoles";

export const APPLICATION_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "dispatched",
  "delivered",
  "issued",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

type ValidationResult = {
  ok: boolean;
  message?: string;
  missingFields?: string[];
};

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ["pending", "approved", "rejected"],
  approved: ["approved", "rejected", "dispatched"],
  rejected: ["rejected", "pending", "approved"],
  dispatched: ["dispatched", "delivered"],
  delivered: ["delivered", "issued"],
  issued: ["issued"],
};

function hasValue(value: unknown) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function getRequiredApprovalFields(user: Record<string, unknown>) {
  const requiredChecks: Array<[string, boolean]> = [
    ["photo", hasValue(user.photo)],
    ["idProof", hasValue(user.idProof)],
    ["addressProof", hasValue(user.addressProof)],
    ["pan", hasValue(user.pan)],
    ["address", hasValue(user.address)],
    ["city", hasValue(user.city)],
    ["state", hasValue(user.state)],
    ["pincode", hasValue(user.pincode)],
    ["certificateClass", hasValue(user.certificateClass)],
    ["certType", hasValue(user.certType)],
    ["validity", hasValue(user.validity)],
    ["tokenType", hasValue(user.tokenType)],
  ];

  return requiredChecks.filter(([, present]) => !present).map(([field]) => field);
}

export function validateStatusTransition(
  user: Record<string, unknown>,
  nextStatus: string,
): ValidationResult {
  const targetStatus = nextStatus as ApplicationStatus;

  if (!APPLICATION_STATUSES.includes(targetStatus)) {
    return { ok: false, message: "Invalid status" };
  }

  const currentStatus = ((user.status as string) || "pending") as ApplicationStatus;
  const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowedStatuses.includes(targetStatus)) {
    return {
      ok: false,
      message: `Cannot move application from ${currentStatus} to ${targetStatus}`,
    };
  }

  if (targetStatus === "approved") {
    const missingFields = getRequiredApprovalFields(user);
    if (missingFields.length > 0) {
      return {
        ok: false,
        message: "Cannot approve without all required documents and applicant details",
        missingFields,
      };
    }
  }

  if (targetStatus === "dispatched" && user.paymentStatus !== "paid") {
    return {
      ok: false,
      message: "Cannot dispatch before payment is marked paid",
    };
  }

  if (targetStatus === "delivered" && currentStatus !== "dispatched") {
    return {
      ok: false,
      message: "Cannot mark delivered before dispatch",
    };
  }

  if (targetStatus === "issued" && currentStatus !== "delivered") {
    return {
      ok: false,
      message: "Cannot activate or issue before delivery is completed",
    };
  }

  return { ok: true };
}

export function getStatusPermission(status: string) {
  switch (status) {
    case "approved":
    case "rejected":
    case "pending":
      return "review_application" as const;
    case "dispatched":
      return "dispatch_application" as const;
    case "delivered":
      return "mark_delivered" as const;
    case "issued":
      return "issue_application" as const;
    default:
      return "review_application" as const;
  }
}

export function canAdminChangeToStatus(role: AdminRole, status: string) {
  return hasAdminPermission(role, getStatusPermission(status));
}
