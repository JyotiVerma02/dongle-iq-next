"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
  Fingerprint,
  Loader2,
  Mail,
  PencilLine,
  Phone,
  RefreshCw,
  Settings,
  User,
  Users,
  XCircle,
} from "lucide-react";
import UserLedgerView, { type DashboardUser } from "@/components/UserLedger";
import UserDongleView, { type DongleRecord } from "@/components/UserDongle";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type DashboardView = "home" | "admin" | "ledger" | "dongle";

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
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [view, setView] = useState<DashboardView>("home");
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [dongleRecords, setDongleRecords] = useState<DongleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isEditingAdmin, setIsEditingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    number: "",
    role: "",
  });
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");

  const fetchDashboardData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const [adminRes, usersRes, dongleRes] = await Promise.all([
        fetch("/api/get-admin", { cache: "no-store" }),
        fetch("/api/get-users", { cache: "no-store" }),
        fetch("/api/admin/dongle-records", { cache: "no-store" }),
      ]);

      const [adminData, usersData, dongleData] = await Promise.all([
        adminRes.json(),
        usersRes.json(),
        dongleRes.json(),
      ]);

      if (!adminRes.ok || !adminData.success) {
        throw new Error(adminData.message || "Failed to load admin details");
      }

      if (!usersRes.ok || !usersData.success) {
        throw new Error(usersData.message || "Failed to load users");
      }

      if (!dongleRes.ok || !dongleData.success) {
        throw new Error(dongleData.message || "Failed to load dongle records");
      }

      setAdmin(adminData.admin || null);
      setAdminForm({
        name: adminData.admin?.name || "",
        email: adminData.admin?.email || "",
        number: adminData.admin?.number || "",
        role: adminData.admin?.role || "admin",
      });
      setUsers(usersData.users || []);
      setDongleRecords(dongleData.records || []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load dashboard data");
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
    const verified = users.filter((user) => user.isAadhaarVerified).length;

    return {
      total: users.length,
      pending,
      approved,
      rejected,
      verified,
    };
  }, [users]);

  const recentUsers = useMemo(() => users.slice(0, 5), [users]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(false);
  };

  const handleStatusChange = async (
    userId: string,
    status: "approved" | "rejected",
    internalRemarks?: string
  ) => {
    const response = await fetch("/api/admin/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, internalRemarks }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to update status");
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) => (user._id === data.user._id ? data.user : user))
    );
    await fetchDashboardData(false);
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
      setAdminMessage("Admin profile updated successfully.");
    } catch (saveError) {
      setAdminMessage(saveError instanceof Error ? saveError.message : "Failed to update admin profile");
    } finally {
      setSavingAdmin(false);
    }
  };

  return (
    <div
      className="theme-transition flex min-h-screen"
      style={{
        color: colors.text,
        background: isDarkMode
          ? "radial-gradient(circle at top, #46556d 0%, #232b37 42%, #121820 100%)"
          : "radial-gradient(circle at top, #f5f9ff 0%, #e9f0fb 48%, #dbe7f5 100%)",
      }}
    >
      <aside
        className={`theme-transition fixed inset-y-0 left-0 z-40 w-72 border-r px-5 py-6 backdrop-blur-xl transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:relative lg:translate-x-0`}
        style={{ borderColor: colors.borderSoft, backgroundColor: colors.overlay }}
      >
        <div className="flex h-full flex-col">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#45c3b9] text-[#081214]">
                <Users size={22} />
              </div>
              <div>
                <p className="text-lg font-black uppercase tracking-tight">
                  Dongle <span className="text-[#45c3b9]">IQ</span>
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Admin Panel</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavItem label="Overview" active={view === "home"} onClick={() => setView("home")} icon={<FileText size={18} />} />
              <NavItem label="User Ledger" active={view === "ledger"} onClick={() => setView("ledger")} icon={<Users size={18} />} />
              <NavItem label="Dongle Records" active={view === "dongle"} onClick={() => setView("dongle")} icon={<Fingerprint size={18} />} />
              <NavItem label="Admin Profile" active={view === "admin"} onClick={() => setView("admin")} icon={<User size={18} />} />
            </nav>
          </div>

          <div className="theme-transition mt-auto rounded-[1.75rem] border p-4" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}>
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Logged in admin</p>
            <p className="mt-3 text-lg font-black text-white">{admin?.name || "Admin"}</p>
            <p className="mt-1 text-sm text-slate-400">{admin?.email || "No email found"}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
              <span>{admin?.role || "admin"}</span>
              <span>{admin?.status || "active"}</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header
          className="theme-transition sticky top-0 z-30 flex items-center justify-between border-b px-5 py-4 backdrop-blur-xl lg:px-8"
          style={{ borderColor: colors.borderSoft, backgroundColor: colors.overlay }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Admin workspace</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              {view === "home" && "Dashboard Overview"}
              {view === "ledger" && "Application Ledger"}
              {view === "dongle" && "Dongle Records"}
              {view === "admin" && "Admin Profile"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((current) => !current)}
              className="theme-transition rounded-2xl border px-4 py-2 text-sm font-semibold transition lg:hidden"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}
            >
              Menu
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="theme-transition inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70"
              style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}
            >
              {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
              Refresh
            </button>
            <div className="theme-transition rounded-2xl border p-2" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}>
              <Bell size={18} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-8">
          {error ? (
            <div className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {view === "home" && (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total applications" value={stats.total} accent="teal" icon={<Users size={18} />} />
                <MetricCard label="Pending review" value={stats.pending} accent="amber" icon={<Loader2 size={18} />} />
                <MetricCard label="Approved" value={stats.approved} accent="green" icon={<CheckCircle2 size={18} />} />
                <MetricCard label="Rejected" value={stats.rejected} accent="red" icon={<XCircle size={18} />} />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
                <div className="theme-transition rounded-[2rem] border p-5 shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent users</p>
                      <h2 className="mt-1 text-2xl font-black" style={{ color: colors.text }}>Latest applications</h2>
                    </div>
                    <button
                      onClick={() => setView("ledger")}
                      className="theme-transition rounded-2xl border px-4 py-2 text-sm font-semibold transition"
                      style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}
                    >
                      Open ledger
                    </button>
                  </div>

                  <div className="space-y-3">
                    {loading ? (
                      <p className="text-sm" style={{ color: colors.muted }}>Loading applications...</p>
                    ) : recentUsers.length === 0 ? (
                      <p className="text-sm" style={{ color: colors.muted }}>No applications found.</p>
                    ) : (
                      recentUsers.map((user) => (
                        <div
                          key={user._id}
                          className="theme-transition flex flex-col gap-3 rounded-[1.5rem] border p-4 md:flex-row md:items-center md:justify-between"
                          style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}
                        >
                          <div>
                            <p className="text-base font-bold" style={{ color: colors.text }}>{user.name}</p>
                            <p className="mt-1 text-sm" style={{ color: colors.muted }}>
                              {user.email} • {user.number}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <StatusChip status={user.status} />
                            <span className="text-xs" style={{ color: colors.subtleText }}>{formatDate(user.createdAt)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="theme-transition rounded-[2rem] border p-5 shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Verification</p>
                    <h2 className="mt-1 text-2xl font-black" style={{ color: colors.text }}>Current health</h2>
                    <div className="mt-5 space-y-4">
                      <ProgressRow
                        label="Aadhaar verified"
                        value={stats.verified}
                        total={stats.total}
                        accent="bg-[#45c3b9]"
                      />
                      <ProgressRow
                        label="Approval rate"
                        value={stats.approved}
                        total={Math.max(stats.total, 1)}
                        accent="bg-emerald-400"
                      />
                    </div>
                  </div>

                  <div className="theme-transition rounded-[2rem] border p-5 shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Admin snapshot</p>
                    <div className="mt-4 flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#45c3b9]/15 text-xl font-black text-[#45c3b9]">
                        {admin?.name?.charAt(0) || "A"}
                      </div>
                      <div>
                        <h3 className="text-xl font-black" style={{ color: colors.text }}>{admin?.name || "Admin"}</h3>
                        <p className="mt-1 text-sm" style={{ color: colors.muted }}>{admin?.email || "No email found"}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em]" style={{ color: colors.subtleText }}>
                          {admin?.role || "admin"} • {admin?.number || "No mobile"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setView("admin")}
                      className="theme-transition mt-5 inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition"
                      style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}
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
            <UserLedgerView
              onBack={() => setView("home")}
              users={users}
              loading={loading}
              onStatusChange={handleStatusChange}
            />
          )}

          {view === "dongle" && (
            <UserDongleView
              onBack={() => setView("home")}
              records={dongleRecords}
              loading={loading}
            />
          )}

          {view === "admin" && (
            <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div className="theme-transition rounded-[2rem] border p-6 shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Profile</p>
                    <h2 className="mt-1 text-3xl font-black" style={{ color: colors.text }}>{admin?.name || "Admin"}</h2>
                    <p className="mt-2 max-w-xl text-sm leading-6" style={{ color: colors.muted }}>
                      Keep your admin contact details updated so the panel always shows the correct owner and communication channel.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditingAdmin((current) => !current);
                      setAdminMessage("");
                    }}
                    className="theme-transition inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition"
                    style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}
                  >
                    <PencilLine size={16} />
                    {isEditingAdmin ? "Close edit" : "Edit"}
                  </button>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  <ProfileCard label="Admin name" value={admin?.name || "Not set"} icon={<User size={16} />} />
                  <ProfileCard label="Email" value={admin?.email || "Not set"} icon={<Mail size={16} />} />
                  <ProfileCard label="Phone" value={admin?.number || "Not set"} icon={<Phone size={16} />} />
                  <ProfileCard label="Role" value={admin?.role || "admin"} icon={<Settings size={16} />} />
                </div>

                {adminMessage ? (
                  <div className="theme-transition mt-6 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel, color: colors.text }}>
                    {adminMessage}
                  </div>
                ) : null}
              </div>

              <div className="theme-transition rounded-[2rem] border p-6 shadow-2xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Edit details</p>
                <h3 className="mt-1 text-2xl font-black" style={{ color: colors.text }}>Admin settings</h3>

                <div className="mt-6 space-y-4">
                  <InputField
                    label="Full name"
                    value={adminForm.name}
                    onChange={(value) => setAdminForm((current) => ({ ...current, name: value }))}
                    disabled={!isEditingAdmin}
                  />
                  <InputField
                    label="Email"
                    value={adminForm.email}
                    onChange={(value) => setAdminForm((current) => ({ ...current, email: value }))}
                    disabled={!isEditingAdmin}
                  />
                  <InputField
                    label="Phone"
                    value={adminForm.number}
                    onChange={(value) => setAdminForm((current) => ({ ...current, number: value }))}
                    disabled={!isEditingAdmin}
                  />
                  <InputField
                    label="Role"
                    value={adminForm.role}
                    onChange={(value) => setAdminForm((current) => ({ ...current, role: value }))}
                    disabled={!isEditingAdmin}
                  />
                </div>

                <button
                  onClick={handleAdminSave}
                  disabled={!isEditingAdmin || savingAdmin}
                  className="mt-6 w-full rounded-2xl bg-[#45c3b9] px-4 py-3 text-sm font-black text-[#091315] transition hover:bg-[#3db5ab] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingAdmin ? "Saving..." : "Save admin profile"}
                </button>
              </div>
            </section>
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
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  return (
    <button
      onClick={onClick}
      className="theme-transition flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition"
      style={{
        backgroundColor: active ? "rgba(69,195,185,0.12)" : "transparent",
        color: active ? colors.text : colors.muted,
      }}
    >
      <span className="flex items-center gap-3">
        {icon}
        {label}
      </span>
      <ChevronRight size={16} className={active ? "text-[#45c3b9]" : "text-slate-600"} />
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
    <div className="theme-transition rounded-[1.75rem] border p-5 shadow-xl" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panelStrong }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-black" style={{ color: colors.text }}>{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accentStyles[accent]}`}>{icon}</div>
      </div>
    </div>
  );
}

function ProfileCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  return (
    <div className="theme-transition min-w-0 rounded-[1.5rem] border p-4" style={{ borderColor: colors.borderSoft, backgroundColor: colors.panel }}>
      <div className="flex items-center gap-3" style={{ color: colors.text }}>
        <span className="text-[#45c3b9]">{icon}</span>
        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <p className="mt-3 min-w-0 break-all text-base font-bold" style={{ color: colors.text }}>{value}</p>
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
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="theme-transition mt-2 w-full rounded-2xl border px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
        style={{ borderColor: colors.inputBorder, backgroundColor: colors.input, color: colors.text }}
      />
    </label>
  );
}

function StatusChip({ status }: { status: DashboardUser["status"] }) {
  const styles = {
    pending: "border-amber-400/25 bg-amber-400/10 text-amber-300",
    approved: "border-emerald-400/25 bg-emerald-400/10 text-emerald-300",
    rejected: "border-rose-400/25 bg-rose-400/10 text-rose-300",
  };

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${styles[status]}`}>
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
  const safeTotal = total > 0 ? total : 1;
  const percentage = Math.min(100, Math.round((value / safeTotal) * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span style={{ color: colors.text }}>{label}</span>
        <span style={{ color: colors.subtleText }}>{percentage}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: colors.borderSoft }}>
        <div className={`h-2 rounded-full ${accent}`} style={{ width: `${percentage}%` }} />
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
