import { normalizeAdminRole, type AdminRole } from "@/lib/adminRoles";

type Primitive = string | number | boolean | null | undefined;

export type AuditChange = {
  field: string;
  previousValue: Primitive | Record<string, unknown> | Array<unknown>;
  newValue: Primitive | Record<string, unknown> | Array<unknown>;
};

export type AdminActor = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type AuditEntryInput = {
  action: string;
  actor: AdminActor;
  changes?: AuditChange[];
  fromStatus?: string;
  toStatus?: string;
  remarks?: string;
  metadata?: Record<string, unknown>;
};

function normalizeValue(value: unknown) {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  return value as Primitive | Record<string, unknown> | Array<unknown>;
}

export function buildChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>,
  fields: string[],
) {
  return fields.reduce<AuditChange[]>((changes, field) => {
    const previousValue = normalizeValue(before[field]);
    const newValue = normalizeValue(after[field]);

    if (JSON.stringify(previousValue) !== JSON.stringify(newValue)) {
      changes.push({
        field,
        previousValue,
        newValue,
      });
    }

    return changes;
  }, []);
}

export function createAuditEntry(input: AuditEntryInput) {
  return {
    action: input.action,
    actorId: input.actor.id,
    actorName: input.actor.name,
    actorEmail: input.actor.email,
    actorRole: normalizeAdminRole(input.actor.role) as AdminRole,
    timestamp: new Date(),
    changes: input.changes || [],
    fromStatus: input.fromStatus,
    toStatus: input.toStatus,
    remarks: input.remarks,
    metadata: input.metadata || {},
  };
}

export function createLegacyActionHistoryEntry(input: AuditEntryInput) {
  return {
    action: input.toStatus || input.action,
    performedBy: `${input.actor.name} (${input.actor.email})`,
    timestamp: new Date(),
    remarks:
      input.remarks ||
      input.toStatus ||
      input.action,
  };
}
