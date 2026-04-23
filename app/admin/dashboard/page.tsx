"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
  Loader2,
  Mail,
  Moon,
  PencilLine,
  Phone,
  RefreshCw,
  Settings,
  SunMedium,
  User,
  Users,
  XCircle,
} from "lucide-react";
import UserLedgerView, { type DashboardUser } from "@/components/UserLedger";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";
import { Menu } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

type DashboardView = "home" | "admin" | "ledger";

interface AdminProfile {
  _id?: string;
  name?: string;
  email?: string;
  number?: string;
  role?: string;
  status?: string;
  createdAt?: string;
}

export default function DongleIQAdminHub() {
  const { isDarkMode, toggleTheme } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [view, setView] = useState<DashboardView>("home");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    number: "",
    role: "",
  });
  const router = useRouter();
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [adminRes, usersRes] = await Promise.all([
        fetch("/api/get-admin", { cache: "no-store" }),
        fetch("/api/get-users", { cache: "no-store" }),
      ]);

      const [adminData, usersData] = await Promise.all([
        adminRes.json(),
        usersRes.json(),
      ]);

      if (!adminRes.ok || !adminData.success) {
        throw new Error(adminData.message || "Failed to load admin details");
      }

      if (!usersRes.ok || !usersData.success) {
        throw new Error(usersData.message || "Failed to load users");
      }

      setAdmin(adminData.admin || null);
      setAdminForm({
        name: adminData.admin?.name || "",
        email: adminData.admin?.email || "",
        number: adminData.admin?.number || "",
        role: adminData.admin?.role || "admin",
      });
      setUsers(usersData.users || []);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load dashboard data",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const pending = users.filter((user) => user.status === "pending").length;
    const approved = users.filter((user) => user.status === "approved").length;
    const rejected = users.filter((user) => user.status === "rejected").length;
    const verified = users.filter(
      (user) => user?.isAadhaarVerified === true,
    ).length;

    return {
      total: users.length,
      pending,
      approved,
      rejected,
      verified,
    };
  }, [users]);

  const [search, setSearch] = useState("");
  const [latestPage, setLatestPage] = useState(1);
  const itemsPerPage = 10;

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

  const totalLatestPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  useEffect(() => {
    setLatestPage(1);
  }, [search]);

  useEffect(() => {
    if (!filteredUsers.length) {
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

  const handleLogout = () => {
    // clear auth (examples)
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    toast.success("Logged out successfully");

    // redirect to register/login page
    router.push("/admin/register"); // or "/admin/login"
  };
  const handleStatusChange = async (
    userId: string,
    status: "approved" | "rejected",
    internalRemarks?: string,
  ) => {
    const response = await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, internalRemarks }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      toast.error(data.message || "Failed to update status");
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user._id === data.user._id ? data.user : user,
      ),
    );

    // ✅ Add here
    toast.success(`User ${status} successfully`);
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
  const chartData = [
    { name: "Approved", value: stats.approved },
    { name: "Pending", value: stats.pending },
    { name: "Rejected", value: stats.rejected },
  ];

  return (
    <div
      className="theme-transition flex min-h-screen overflow-hidden text-[13px]"
      style={{
        color: colors.text,
        background: isDarkMode
          ? "radial-gradient(circle at top, #334155 0%, #1e293b 40%, #0f172a 100%)"
          : "radial-gradient(circle at top, #f8fbff 0%, #eef4ff 45%, #dbeafe 100%)",
      }}
    >
      <aside
        className={`theme-transition fixed inset-y-0 left-0 z-50 flex transform flex-col border-r px-4 py-5 transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "w-20" : "w-64 xl:w-72"} lg:static lg:translate-x-0`}
        style={{
          width: isCollapsed ? "5.5rem" : "18rem",
          borderColor: isDarkMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.06)",
          backgroundColor: colors.overlay,
        }}
      >
        <div className="flex h-full flex-col">
          <div>
            <div className="mb-10 flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#45c3b9] text-[#081214]">
                <Users size={22} />
              </div>

              {!isCollapsed && (
                <div>
                  <p className="text-lg font-black uppercase tracking-tight">
                    Dongle <span className="text-[#45c3b9]">IQ</span>
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: colors.subtleText }}
                  >
                    Admin Panel
                  </p>
                </div>
              )}
            </div>

            <nav className="space-y-1">
              <NavItem
                label="Overview"
                active={view === "home"}
                onClick={() => setView("home")}
                icon={<FileText size={18} />}
                collapsed={isCollapsed}
              />
              <NavItem
                label="User Ledger"
                active={view === "ledger"}
                onClick={() => setView("ledger")}
                icon={<Users size={18} />}
                collapsed={isCollapsed}
              />

              <NavItem
                label="Admin Profile"
                active={view === "admin"}
                onClick={() => setView("admin")}
                icon={<User size={18} />}
                collapsed={isCollapsed}
              />
            </nav>
          </div>

          {!isCollapsed && (
            <div
              className="theme-transition mt-auto rounded-lg border p-4"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
              }}
            >
              <p
                className="text-[11px] uppercase tracking-[0.16em]"
                style={{ color: colors.subtleText }}
              >
                Logged in admin
              </p>
              <p className="mt-3 text-lg font-black text-white">
                {admin?.name || "Admin"}
              </p>
              <p className="mt-1 text-sm" style={{ color: colors.subtleText }}>
                {admin?.email || "No email found"}
              </p>
              <div className="mt-4 flex items-center justify-between text-[11px]"
                style={{ color: colors.subtleText }}
              >
                <span>{admin?.role || "admin"}</span>
                <span>{admin?.status || "active"}</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <main className="flex min-w-0 flex-1 flex-col h-screen">
        <header
          className="theme-transition sticky top-0 z-30 flex flex-wrap items-start justify-between gap-4 border-b px-5 py-4 backdrop-blur-xl lg:px-8"
          style={{
            borderColor: isDarkMode
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.06)",
            backgroundColor: colors.overlay,
          }}
        >
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                setSidebarOpen((current) => !current);
                setIsCollapsed((current) => !current);
              }}
              className="theme-transition flex items-center justify-center h-10 w-10 rounded-full border transition"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              <Menu size={18} />
            </button>
            <div className="flex items-start gap-4">
              {/* 🔥 Left Accent Icon */}

              {/* 🔥 Text Content */}
              {/* <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Admin Workspace
                </p>

                <h1
                  className="mt-1 text-3xl font-black tracking-tight leading-tight"
                  style={{ color: colors.text }}
                >
                  Dashboard Overview
                </h1>

                <p
                  className="mt-2 text-sm max-w-xl leading-5"
                  style={{ color: colors.muted }}
                >
                  Monitor users, approvals, and system activity in real-time
                  with full control.
                </p>
              </div> */}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 self-center lg:self-auto">
            <button
              onClick={toggleTheme}
              className="theme-transition inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              {isDarkMode ? <SunMedium size={16} /> : <Moon size={16} />}
              {isDarkMode ? "Light" : "Dark"}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="theme-transition inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
            <div
              className="theme-transition rounded-lg border p-2"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              <Bell size={18} />
            </div>
            <button
              onClick={handleLogout}
              className="theme-transition inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:bg-rose-500/10 hover:text-rose-300"
              style={{
                borderColor: isDarkMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.06)",
                backgroundColor: colors.panel,
                color: colors.text,
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-8 min-h-0">
          {error ? (
            <div className="mb-6 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {view === "home" && (
            <div className="h-full overflow-y-auto space-y-6 pr-2 min-h-0">
              <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label=" Applications"
                  value={stats.total}
                  accent="teal"
                  icon={<Users size={18} />}
                />
                <MetricCard
                  label="Pending review"
                  value={stats.pending}
                  accent="amber"
                  icon={<Loader2 size={18} />}
                />
                <MetricCard
                  label="Approved"
                  value={stats.approved}
                  accent="green"
                  icon={<CheckCircle2 size={18} />}
                />
                <MetricCard
                  label="Rejected"
                  value={stats.rejected}
                  accent="red"
                  icon={<XCircle size={18} />}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr] h-full min-h-0">
                {" "}
                <div className="h-full overflow-y-auto pr-2 min-h-0">
                  <div
                    className="theme-transition rounded-lg border p-3 shadow-xl transition-all duration-300 "
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                      backgroundColor: colors.panelStrong,
                    }}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-[0.2em]"
                          style={{ color: colors.subtleText }}
                        >
                          Recent users
                        </p>
                        <h2 className="mt-1 text-xl font-bold tracking-tight">
                          Latest applications
                        </h2>
                      </div>
                      <button
                        onClick={() => setView("ledger")}
                        className="theme-transition rounded-lg border px-3 py-1.5 text-xs font-semibold transition"
                        style={{
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.06)",
                          backgroundColor: colors.panel,
                          color: colors.text,
                        }}
                      >
                        Open ledger
                      </button>
                    </div>
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border px-3 py-1.5 text-xs outline-none"
                        style={{
                          borderColor: isDarkMode
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.06)",
                          backgroundColor: colors.panel,
                          color: colors.text,
                        }}
                      />
                    </div>

                    <div className="divide-y divide-white/5">
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="h-16 rounded-lg bg-white/10 animate-pulse"
                            />
                          ))}
                        </div>
                      ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-10" style={{ color: colors.subtleText }}>
                          <Users className="mx-auto mb-3 opacity-40" />
                          <p>No applications yet</p>
                        </div>
                      ) : (
                        latestUsers.map((user, index) => (
                          <div
                            key={user._id}
                            onClick={() =>
                              setExpandedUserId(
                                expandedUserId === user._id ? null : user._id,
                              )
                            }
                            className="group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 mb-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/10 hover:bg-white/5  "
                            style={{
                              borderColor: isDarkMode
                                ? "rgba(255,255,255,0.06)"
                                : "rgba(0,0,0,0.06)",
                              backgroundColor:
                                index % 2 === 0
                                  ? colors.panel
                                  : isDarkMode
                                    ? "rgba(255,255,255,0.03)"
                                    : "rgba(0,0,0,0.03)",
                            }}
                          >
                            <div className="min-w-0 px-2 py-1">
                              <p className="text-[12px] font-semibold truncate" style={{ color: colors.text }}>
                                {user.name}
                              </p>

                              <p className="text-[10px] truncate" style={{ color: colors.subtleText }}>
                                {user.email} • {user.number}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <StatusChip status={user.status} />
                              <span className="text-[11px]" style={{ color: colors.subtleText }}>
                                {formatDate(user.createdAt)}
                              </span>
                            </div>
                             {expandedUserId === user._id && (
                              <div
                                className="mb-3 rounded-lg border p-3 text-sm"
                                style={{
                                  borderColor: colors.borderSoft,
                                  backgroundColor: colors.panelStrong,
                                }}
                              >
                                <p style={{ color: colors.text }}>
                                  <strong>Name:</strong> {user.name}
                                </p>
                                <p style={{ color: colors.text }}>
                                  <strong>Email:</strong> {user.email}
                                </p>
                                <p style={{ color: colors.text }}>
                                  <strong>Phone:</strong> {user.number}
                                </p>
                                <p style={{ color: colors.text }}>
                                  <strong>Status:</strong> {user.status}
                                </p>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {totalLatestPages > 1 && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm" style={{ color: colors.subtleText }}>
                          Showing {Math.min((latestPage - 1) * itemsPerPage + 1, filteredUsers.length)} to{' '}
                          {Math.min(latestPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} applications
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setLatestPage(Math.max(1, latestPage - 1))}
                            disabled={latestPage === 1}
                            className="theme-transition rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                            style={{
                              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              backgroundColor: colors.panel,
                              color: colors.text,
                            }}
                          >
                            Previous
                          </button>
                          <span className="text-sm" style={{ color: colors.text }}>
                            Page {latestPage} of {totalLatestPages}
                          </span>
                          <button
                            onClick={() => setLatestPage(Math.min(totalLatestPages, latestPage + 1))}
                            disabled={latestPage === totalLatestPages}
                            className="theme-transition rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50"
                            style={{
                              borderColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                              backgroundColor: colors.panel,
                              color: colors.text,
                            }}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  {/* ✅ Verification Card */}
                  <div
                    className="theme-transition rounded-lg border p-4 shadow-xl"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                      backgroundColor: colors.panelStrong,
                    }}
                  >
<p
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: colors.subtleText }}
                  >
                      Verification
                    </p>

                    <h2
                      className="mt-1 text-2xl font-black"
                      style={{ color: colors.text }}
                    >
                      Verification Status
                    </h2>

                    <div className="mt-5 space-y-4">
                      <ProgressRow
                        label="Aadhaar verified"
                        value={stats.verified}
                        accent="bg-gradient-to-r from-[#45c3b9] to-emerald-400"
                        total={stats.total}
                      />
                      <ProgressRow
                        label="Approval rate"
                        value={stats.approved}
                        total={Math.max(stats.total, 1)}
                        accent="bg-emerald-400"
                      />
                    </div>
                  </div>

                  {/* ✅ Pie Chart Card (Separate) */}
                  <div
                    className="theme-transition rounded-lg border p-4 shadow-xl "
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                      backgroundColor: colors.panelStrong,
                    }}
                   >
                    <h3 className="text-lg font-bold mb-4">User Status</h3>

                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            dataKey="value"
                            outerRadius={70}
                            innerRadius={40}
                            paddingAngle={4}
                            label
                            stroke="none" 
  style={{ outline: 'none' }}
                           >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ✅ Admin Snapshot Card */}
                  <div
                    className="theme-transition rounded-lg border p-4 shadow-xl"
                    style={{
                      borderColor: isDarkMode
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.06)",
                      backgroundColor: colors.panelStrong,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-[0.2em]"
                      style={{ color: colors.subtleText }}
                    >
                      Admin snapshot
                    </p>

                    <div className="mt-4 flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#45c3b9]/15 text-xl font-black text-[#45c3b9]">
                        {admin?.name?.charAt(0) || "A"}
                      </div>

                      <div>
                        <h3
                          className="text-xl font-black"
                          style={{ color: colors.text }}
                        >
                          {admin?.name || "Admin"}
                        </h3>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: colors.muted }}
                        >
                          {admin?.email || "No email found"}
                        </p>
                        <p
                          className="mt-2 text-[11px] uppercase tracking-[0.18em]"
                          style={{ color: colors.subtleText }}
                        >
                          {admin?.role || "admin"} •{" "}
                          {admin?.number || "No mobile"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setView("admin")}
                      className="theme-transition mt-5 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold transition"
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.06)",
                        backgroundColor: colors.panel,
                        color: colors.text,
                      }}
                    >
                      Edit profile
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {view === "ledger" && (
            <div className="h-full overflow-y-auto min-h-0">
              <UserLedgerView
                onBack={() => setView("home")}
                users={users}
                loading={loading}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}

          {view === "admin" && (
            <div className="h-full overflow-y-auto min-h-0">
              <div className="mb-6">
                <button
                  onClick={() => setView("home")}
                  className="mb-3 inline-flex items-center gap-2 text-xs font-semibold transition hover:opacity-80"
                  style={{ color: colors.muted }}
                >
                  <ArrowLeft size={14} />
                  Back to overview
                </button>

                <div className="flex items-center justify-between">
                  <h1
                    className="mt-1 text-2xl lg:text-3xl font-black"
                    style={{ color: colors.text }}
                  >
                    Admin Profile
                  </h1>
                </div>

                <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                  Manage admin details, update profile information, and control
                  system access.
                </p>
              </div>
              <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div
                  className="theme-transition rounded-lg border p-6 shadow-2xl"
                  style={{
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: colors.subtleText }}
                      >
                        Profile
                      </p>
                      <h2
                        className="mt-1 text-2xl lg:text-3xl font-black"
                        style={{ color: colors.text }}
                      >
                        {admin?.name || "Admin"}
                      </h2>
                      <p
                        className="mt-2 max-w-xl text-sm leading-6"
                        style={{ color: colors.muted }}
                      >
                        Keep your admin contact details updated so the panel
                        always shows the correct owner and communication
                        channel.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsEditingAdmin((current) => !current);
                        setAdminMessage("");
                      }}
                      className="theme-transition inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition"
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.06)",
                        backgroundColor: colors.panel,
                        color: colors.text,
                      }}
                    >
                      <PencilLine size={16} />
                      {isEditingAdmin ? "Close edit" : "Edit"}
                    </button>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <ProfileCard
                      label="Admin name"
                      value={admin?.name || "Not set"}
                      icon={<User size={16} />}
                    />
                    <ProfileCard
                      label="Email"
                      value={admin?.email || "Not set"}
                      icon={<Mail size={16} />}
                    />
                    <ProfileCard
                      label="Phone"
                      value={admin?.number || "Not set"}
                      icon={<Phone size={16} />}
                    />
                    <ProfileCard
                      label="Role"
                      value={admin?.role || "admin"}
                      icon={<Settings size={16} />}
                    />
                  </div>

                  {adminMessage ? (
                    <div
                      className="theme-transition mt-6 rounded-lg border px-4 py-3 text-sm"
                      style={{
                        borderColor: isDarkMode
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(0,0,0,0.06)",
                        backgroundColor: colors.panel,
                        color: colors.text,
                      }}
                    >
                      {adminMessage}
                    </div>
                  ) : null}
                </div>

                <div
                  className="theme-transition rounded-lg border p-6 shadow-2xl"
                  style={{
                    borderColor: isDarkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                    backgroundColor: colors.panelStrong,
                  }}
                >
                  <p
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: colors.subtleText }}
                  >
                    Edit details
                  </p>
                  <h3
                    className="mt-1 text-2xl font-black"
                    style={{ color: colors.text }}
                  >
                    Admin settings
                  </h3>

                  <div className="mt-6 space-y-4">
                    <InputField
                      label="Full name"
                      value={adminForm.name}
                      onChange={(value) =>
                        setAdminForm((current) => ({ ...current, name: value }))
                      }
                      disabled={!isEditingAdmin}
                    />
                    <InputField
                      label="Email"
                      value={adminForm.email}
                      onChange={(value) =>
                        setAdminForm((current) => ({
                          ...current,
                          email: value,
                        }))
                      }
                      disabled={!isEditingAdmin}
                    />
                    <InputField
                      label="Phone"
                      value={adminForm.number}
                      onChange={(value) =>
                        setAdminForm((current) => ({
                          ...current,
                          number: value,
                        }))
                      }
                      disabled={!isEditingAdmin}
                    />
                    <InputField
                      label="Role"
                      value={adminForm.role}
                      onChange={(value) =>
                        setAdminForm((current) => ({ ...current, role: value }))
                      }
                      disabled={!isEditingAdmin}
                    />
                  </div>

                  <button
                    onClick={handleAdminSave}
                    disabled={!isEditingAdmin || savingAdmin}
                    className="mt-6 w-full rounded-lg bg-[#45c3b9] px-4 py-3 text-sm font-black text-[#091315] transition hover:bg-[#3db5ab] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingAdmin ? "Saving..." : "Save admin profile"}
                  </button>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavItem({
  label,
  active,
  onClick,
  icon,
  collapsed,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  collapsed?: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  return (
    <button
      onClick={onClick}
      title={collapsed ? label : ""}
      className={`flex items-center ${
        collapsed ? "justify-center" : "justify-between"
      } w-full px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200`}
      style={{
        backgroundColor: active ? "rgba(69,195,185,0.15)" : "transparent",
        color: active ? "#45c3b9" : colors.muted,
        border: active
          ? "1px solid rgba(69,195,185,0.3)"
          : "1px solid transparent",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-2.5">
        <span className="flex items-center justify-center">{icon}</span>
        {!collapsed && <span>{label}</span>}
      </div>

      {/* Right arrow */}
      {!collapsed && (
        <ChevronRight
          size={12}
          className={`transition-transform ${
            active ? "translate-x-1 opacity-100" : "opacity-40"
          }`}
        />
      )}
    </button>
  );
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: "teal" | "amber" | "green" | "red";
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const accentStyles = {
    teal: "bg-[#45c3b9]/12 text-[#45c3b9]",
    amber: "bg-amber-400/12 text-amber-300",
    green: "bg-emerald-400/12 text-emerald-300",
    red: "bg-rose-400/12 text-rose-300",
  };

  return (
    <div
      className="theme-transition rounded-lg border p-4 lg:p-5 shadow-xl"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: colors.panelStrong,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{ color: colors.subtleText }}
          >
            {label}
          </p>
          <p
            className="mt-3 text-3xl font-black"
            style={{ color: colors.text }}
          >
            {value}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${accentStyles[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

function ProfileCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  return (
    <div
      className="theme-transition min-w-0 rounded-lg border p-3"
      style={{
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        backgroundColor: colors.panel,
      }}
    >
      <div className="flex items-center gap-2" style={{ color: colors.text }}>
        <span className="text-[#45c3b9]">{icon}</span>
        <span className="text-[11px] uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
          {label}
        </span>
      </div>
      <p
        className="mt-3 min-w-0 break-all text-[13px] font-bold"
        style={{ color: colors.text }}
      >
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] " style={{ color: colors.subtleText }}>
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="theme-transition mt-2 w-full rounded-lg border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          borderColor: colors.inputBorder,
          backgroundColor: colors.input,
          color: colors.text,
        }}
      />
    </label>
  );
}

function StatusChip({ status }: { status: DashboardUser["status"] }) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const styles = {
    pending: "border-yellow-400/30 bg-yellow-400/20 text-yellow-300",
    approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    rejected: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold capitalize ${styles[status]}`}
      style={{ color: colors.text }}
    >
      {status}
    </span>
  );
}

function ProgressRow({
  label,
  value,
  total,
  accent,
}: {
  label: string;
  value: number;
  total: number;
  accent: string;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const safeTotal = Math.max(total, 1);
  const percentage = Math.min(100, Math.round((value / safeTotal) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span style={{ color: colors.text }}>{label}</span>
        <span style={{ color: colors.subtleText }}>{percentage}%</span>
      </div>
      <div
        className="h-2 rounded-full"
        style={{ backgroundColor: colors.borderSoft }}
      >
        <div
          className={`h-2 rounded-full ${accent} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Unknown date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
