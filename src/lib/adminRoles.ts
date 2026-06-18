export const ADMIN_ROLES = [
  "super_admin",
  "reviewer",
  "dispatcher",
  "support_team",
  "finance_admin",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_PERMISSIONS = [
  "view_applications",
  "review_application",
  "dispatch_application",
  "mark_delivered",
  "issue_application",
  "update_payment",
  "delete_application",
  "invite_admin",
  "manage_application_details",
  "leave_internal_note",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<AdminRole, readonly AdminPermission[]> = {
  super_admin: ADMIN_PERMISSIONS,
  reviewer: [
    "view_applications",
    "review_application",
    "manage_application_details",
    "leave_internal_note",
  ],
  dispatcher: [
    "view_applications",
    "dispatch_application",
    "mark_delivered",
    "issue_application",
    "leave_internal_note",
  ],
  support_team: [
    "view_applications",
    "manage_application_details",
    "leave_internal_note",
  ],
  finance_admin: [
    "view_applications",
    "update_payment",
    "leave_internal_note",
  ],
};

export function normalizeAdminRole(role?: string | null): AdminRole {
  switch ((role || "").trim().toLowerCase()) {
    case "reviewer":
      return "reviewer";
    case "dispatcher":
      return "dispatcher";
    case "support_team":
    case "support":
      return "support_team";
    case "finance_admin":
    case "finance":
      return "finance_admin";
    case "super_admin":
    case "superadmin":
    case "admin":
    default:
      return "super_admin";
  }
}

export function isAdminRole(role?: string | null): boolean {
  if (!role) return false;
  const normalized = role.trim().toLowerCase();
  return [
    "reviewer", "dispatcher", "support_team", "support", 
    "finance_admin", "finance", "super_admin", "superadmin", "admin"
  ].includes(normalized);
}

export function hasAdminPermission(role: string | null | undefined, permission: AdminPermission) {
  const normalizedRole = normalizeAdminRole(role);
  return ROLE_PERMISSIONS[normalizedRole].includes(permission);
}

export function getAdminRoleLabel(role?: string | null) {
  return normalizeAdminRole(role)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
