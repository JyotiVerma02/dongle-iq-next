"use client";

import type { DashboardUser } from "@/components/UserLedger";
import AdminApplicationsPanel from "@/components/admin/AdminApplicationsPanel";

export function Applications({
  users,
  loading,
  onUsersChange,
}: {
  users: DashboardUser[];
  loading: boolean;
  onUsersChange: (users: DashboardUser[]) => void;
}) {
  return (
    <AdminApplicationsPanel
      onBack={() => {}}
      users={users}
      loading={loading}
      onUsersChange={onUsersChange}
    />
  );
}
