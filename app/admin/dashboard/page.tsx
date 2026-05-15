"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import UserLedgerView, { type DashboardUser } from "@/components/UserLedger";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import {
  AdminProfileSection,
  Applications,
  DashboardHome,
  Header,
  Sidebar,
} from "@/components/admin-dashboard";
  import TrackDSCView from "@/components/admin-dashboard/TrackDSCView";
import type {
  AdminProfile,
  DashboardStats,
  DashboardView,
} from "@/components/admin-dashboard/types";

export default function DongleIQAdminHub() {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [view, setView] = useState<DashboardView>("home");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    number: "",
    role: "",
  });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [latestPage, setLatestPage] = useState(1);
  const router = useRouter();
  const itemsPerPage = 10;

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const adminRes = await fetch("/api/get-admin", { cache: "no-store" });
      const usersRes = await fetch("/api/get-users", { cache: "no-store" });

      const adminData = await adminRes.json().catch(() => null);
      const usersData = await usersRes.json().catch(() => null);

      if (!adminRes.ok || !adminData?.success) {
        throw new Error(adminData?.message || "Failed to load admin");
      }

      if (!usersRes.ok || !usersData?.success) {
        throw new Error(usersData?.message || "Failed to load users");
      }

      setAdmin(adminData.admin ?? null);
      setAdminForm({
        name: adminData.admin?.name || "",
        email: adminData.admin?.email || "",
        number: adminData.admin?.number || "",
        role: adminData.admin?.role || "admin",
      });
      setUsers(usersData.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchDashboardData();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setSidebarOpen(event.matches);
      if (!event.matches) setIsCollapsed(false);
    };

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const stats = useMemo<DashboardStats>(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let issued = 0;
    let verified = 0;
    let dscCommission = 0;
    let tokenAmount = 0;
    let assistedAmount = 0;
    let totalCommission = 0;
    let gstPaid = 0;
    let paidCommission = 0;
    let unpaidCommission = 0;

    for (const user of users) {
      if (user.status === "pending") pending++;
      if (user.status === "approved") approved++;
      if (user.status === "rejected") rejected++;
      if (user.status === "issued") issued++;
      if (user.isAadhaarVerified) verified++;

      const commission = Number(user.commission || 0);
      const price = Number(user.price || 0);
      const gst = Number(user.gst || 0);

      totalCommission += commission;

      if (user.serviceType === "dsc") dscCommission += commission;
      if (user.serviceType === "token") tokenAmount += price;
      if (user.serviceType === "assisted") assistedAmount += price;

      if (user.paymentStatus === "paid") {
        paidCommission += commission;
        gstPaid += gst;
      } else if (user.paymentStatus === "unpaid") {
        unpaidCommission += commission;
      }
    }

    return {
      totalUsers: users.length,
      total: users.length,
      pending,
      approved,
      rejected,
      issued,
      verified,
      dscCommission,
      tokenAmount,
      assistedAmount,
      totalCommission,
      gstPaid,
      paidCommission,
      pendingApproval: pending,
      unpaidCommission,
    };
  }, [users]);

  const sortedOrders = useMemo(() => {
    return [...users].sort((a, b) => {
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      return bTime - aTime;
    });
  }, [users]);

  const newOrders = useMemo(() => sortedOrders.slice(0, 10), [sortedOrders]);
  const oldOrders = useMemo(() => sortedOrders.slice(10), [sortedOrders]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      return (
        user.name?.toLowerCase().includes(searchText) ||
        user.email?.toLowerCase().includes(searchText) ||
        user.number?.includes(searchText) ||
        user.status?.toLowerCase().includes(searchText)
      );
    });
  }, [users, search]);

  const latestUsers = useMemo(() => {
    const startIndex = (latestPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, latestPage]);

  const totalLatestPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / itemsPerPage),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLatestPage(1);
  }, [search]);

  useEffect(() => {
    if (!filteredUsers.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedUserId(null);
      return;
    }

    setExpandedUserId((current) => {
      if (current && filteredUsers.some((user) => user._id === current)) {
        return current;
      }

      return filteredUsers[0]?._id ?? null;
    });
  }, [filteredUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(false);
    toast.success("Dashboard refreshed");
  };

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsCollapsed((current) => !current);
      setSidebarOpen(true);
      return;
    }

    setSidebarOpen((current) => !current);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    router.push("/admin/register");
  };

  const handleStatusChange = async (
    userId: string,
    status: "approved" | "rejected",
    internalRemarks?: string,
  ) => {
    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status, internalRemarks }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      setUsers((prev) =>
        prev.map((user) => (user._id === data.user._id ? data.user : user)),
      );
      toast.success(`User ${status} successfully`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const handlePaymentChange = async (
    userId: string,
    paymentStatus: "paid" | "unpaid",
  ) => {
    try {
      const response = await fetch("/api/admin/update-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, paymentStatus }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update payment");
      }

      setUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? data.user : user,
        ),
      );
      toast.success(`Marked as ${paymentStatus}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  };

  const handleAdminSave = async () => {
    setSavingAdmin(true);
    setAdminMessage("");

    try {
      const response = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminForm),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update admin profile");
      }

      setAdmin(data.admin);
      setAdminForm({
        name: data.admin?.name || "",
        email: data.admin?.email || "",
        number: data.admin?.number || "",
        role: data.admin?.role || "admin",
      });
      setIsEditingAdmin(false);
      toast.success("Admin updated successfully");
    } catch {
      toast.error("Failed to update admin");
    } finally {
      setSavingAdmin(false);
    }
  };

  const chartData = useMemo(
    () => [
      { name: "Approved", value: stats.approved },
      { name: "Pending", value: stats.pending },
      { name: "Rejected", value: stats.rejected },
      { name: "Issued", value: stats.issued },
    ],
    [stats.approved, stats.pending, stats.rejected, stats.issued],
  );

  return (
    <div
      className="theme-transition flex min-h-screen overflow-hidden text-[13px]"
      style={{
        color: colors.text,
        background: isDarkMode
          ? "linear-gradient(180deg, rgba(10,18,34,0.98) 0%, rgba(8,16,29,1) 100%)"
          : "linear-gradient(180deg, rgba(246,249,253,1) 0%, rgba(234,240,248,1) 100%)",
      }}
    >
      <Sidebar
        view={view}
        admin={admin}
        isCollapsed={isCollapsed}
        isSidebarOpen={isSidebarOpen}
        onViewChange={setView}
      />

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main className="flex min-h-screen min-w-0 flex-1 flex-col lg:h-screen">
        <Header
          admin={admin}
          onSidebarToggle={handleSidebarToggle}
          onRefresh={handleRefresh}
          onLogout={handleLogout}
          refreshing={refreshing}
          onOpenAdminSettings={() => setView("admin")}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5 lg:px-6">
          {error ? (
            <div
              className="mb-6 rounded-lg border px-4 py-3 text-sm"
              style={{
                borderColor: isDarkMode ? "rgba(251,113,133,0.35)" : "rgba(244,63,94,0.28)",
                backgroundColor: isDarkMode ? "rgba(244,63,94,0.12)" : "rgba(244,63,94,0.08)",
                color: isDarkMode ? "rgba(254,226,226,0.95)" : "#9f1239",
              }}
            >
              {error}
            </div>
          ) : null}

          {view === "home" ? (
            <DashboardHome
              admin={admin}
              stats={stats}
              loading={loading}
              search={search}
              latestPage={latestPage}
              itemsPerPage={itemsPerPage}
              filteredUsers={filteredUsers}
              latestUsers={latestUsers}
              totalLatestPages={totalLatestPages}
              expandedUserId={expandedUserId}
              chartData={chartData}
              isDarkMode={isDarkMode}
              colors={colors}
              onSearchChange={setSearch}
              onLatestPageChange={setLatestPage}
              onExpandedUserIdChange={setExpandedUserId}
              onViewChange={setView}
            />
          ) : null}

          {view === "ledger" ? (
            <div className="h-full overflow-y-auto min-h-0">
              <UserLedgerView
                onBack={() => setView("home")}
                users={sortedOrders}
                loading={loading}
                title="All Applicants"
                description="See every applicant first, then use the sidebar to switch into new and old order groups."
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            </div>
          ) : null}

          {view === "ledger-new" ? (
            <div className="h-full overflow-y-auto min-h-0">
              <UserLedgerView
                onBack={() => setView("home")}
                users={newOrders}
                loading={loading}
                title="New Orders"
                description="Latest applicants are grouped here so the newest submissions are easy to review first."
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            </div>
          ) : null}

          {view === "ledger-old" ? (
            <div className="h-full overflow-y-auto min-h-0">
              <UserLedgerView
                onBack={() => setView("home")}
                users={oldOrders}
                loading={loading}
                title="Old Orders"
                description="Earlier applicants are grouped here after the newest submissions."
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
              />
            </div>
          ) : null}

          {view === "admin" ? (
            <AdminProfileSection
              admin={admin}
              adminForm={adminForm}
              isDarkMode={isDarkMode}
              colors={colors}
              isEditingAdmin={isEditingAdmin}
              savingAdmin={savingAdmin}
              adminMessage={adminMessage}
              onToggleEdit={() => {
                setIsEditingAdmin((current) => !current);
                setAdminMessage("");
              }}
              onAdminFormChange={(field, value) =>
                setAdminForm((current) => ({ ...current, [field]: value }))
              }
              onSave={handleAdminSave}
            />
          ) : null}

          {view === "applications" ? (
            <Applications
              users={users}
              loading={loading}
              onUsersChange={setUsers}
            />
          ) : null}

          {view === "track-dsc" ? (
            <TrackDSCView /> // 👈 YOUR COMPONENT HERE
          ) : null}
        </div>
      </main>
    </div>
  );
}
