import { useState } from "react";
import { User, Shield, Users, Palette, HardDrive } from "lucide-react";
import { AdminProfile } from "../../types";

interface AdminSettingsViewProps {
  admin: AdminProfile | null;
  toggleTheme?: () => void;
  isDarkMode?: boolean;
}

export function AdminSettingsView({ admin, toggleTheme, isDarkMode }: AdminSettingsViewProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-xl font-black uppercase tracking-tight text-[var(--foreground)]">
          Administrator Settings
        </h2>
        <p className="mt-1 text-xs font-semibold text-[var(--muted)]">
          Manage your account, security, and system preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Settings */}
        <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">Profile Settings</h3>
          </div>
          
          <div className="flex items-start space-x-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-black text-white shadow-md" style={{ background: "var(--brand-gradient)" }}>
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div>
              <p className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wider">{admin?.name || "Jyoti Verma"}</p>
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-0.5">{admin?.email || "jyoti@dongleiq.com"}</p>
              <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">{admin?.number || "+91 98765 43210"}</p>
              <span className="mt-2 inline-flex rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">
                {admin?.role || "Super Admin"}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Edit Profile
            </button>
            <button className="theme-transition inline-flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
              Change Password
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">Security Settings</h3>
          </div>
          
          <ul className="space-y-6">
            <li className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Two-Factor Authentication</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-0.5">Add an extra layer of security</p>
              </div>
              <button className="theme-transition inline-flex items-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
                Enable
              </button>
            </li>
            <li className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Session Timeout</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-0.5">Auto-logout after inactivity</p>
              </div>
              <select className="rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] py-1.5 pl-3 pr-8 text-[10px] font-black uppercase tracking-wider focus:border-[var(--accent)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--accent)]">
                <option>30 MINUTES</option>
                <option>1 HOUR</option>
                <option>4 HOURS</option>
              </select>
            </li>
            <li className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Login Alerts</p>
                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mt-0.5">Notify on new devices</p>
              </div>
              <div className="flex space-x-2">
                <span className="inline-flex items-center rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">✓ Email</span>
                <span className="inline-flex items-center rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">✓ SMS</span>
              </div>
            </li>
          </ul>
        </div>

        {/* User Management */}
        <div className="lg:col-span-2 ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">User Management</h3>
            </div>
            <button className="theme-primary-btn theme-transition inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              + Add New User
            </button>
          </div>
          
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--background-alt)]">
                <tr className="border-b border-[var(--border-soft)] text-[10px] font-black uppercase tracking-[0.24em] text-[var(--muted)]">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-soft)]">
                <tr className="transition-colors hover:bg-[var(--background-alt)]">
                  <td className="px-4 py-4 font-semibold text-xs text-[var(--foreground)] uppercase">Admin1</td>
                  <td className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">a1@e.com</td>
                  <td className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">Super Admin</td>
                  <td className="px-4 py-4"><span className="inline-flex rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-500">Active</span></td>
                  <td className="px-4 py-4 text-right">
                    <button className="theme-transition inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)] hover:bg-[var(--background-alt)]">Edit</button>
                    <button className="theme-transition inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500 hover:bg-[var(--background-alt)]">Del</button>
                  </td>
                </tr>
                <tr className="transition-colors hover:bg-[var(--background-alt)]">
                  <td className="px-4 py-4 font-semibold text-xs text-[var(--foreground)] uppercase">Manager1</td>
                  <td className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--muted)]">m1@e.com</td>
                  <td className="px-4 py-4 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]">Manager</td>
                  <td className="px-4 py-4"><span className="inline-flex rounded-full bg-[var(--background-alt)] px-2 py-1 text-[10px] font-black uppercase tracking-wider text-orange-500">Active</span></td>
                  <td className="px-4 py-4 text-right">
                    <button className="theme-transition inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--accent)] hover:bg-[var(--background-alt)]">Edit</button>
                    <button className="theme-transition inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500 hover:bg-[var(--background-alt)]">Del</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Preferences */}
        <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              <Palette className="h-5 w-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">Preferences</h3>
          </div>
          <ul className="space-y-6">
            <li className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="mb-2 sm:mb-0">
                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Theme Mode</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => !isDarkMode && toggleTheme?.()}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                    isDarkMode 
                      ? "bg-[var(--accent-faint)] text-[var(--accent)] border border-[var(--accent)]"
                      : "bg-[var(--background-alt)] text-[var(--foreground)] border border-[var(--border-soft)] hover:brightness-95"
                  }`}
                >
                  🌙 Dark
                </button>
                <button 
                  onClick={() => isDarkMode && toggleTheme?.()}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors ${
                    !isDarkMode 
                      ? "bg-[var(--accent-faint)] text-[var(--accent)] border border-[var(--accent)]"
                      : "bg-[var(--background-alt)] text-[var(--foreground)] border border-[var(--border-soft)] hover:brightness-95"
                  }`}
                >
                  ☀️ Light
                </button>
              </div>
            </li>
            <li className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">Language</p>
              </div>
              <select className="rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] py-1.5 pl-3 pr-8 text-[10px] font-black uppercase tracking-wider focus:border-[var(--accent)] text-[var(--foreground)] focus:ring-1 focus:ring-[var(--accent)]">
                <option>ENGLISH</option>
                <option>HINDI</option>
              </select>
            </li>
          </ul>
        </div>

        {/* System Actions */}
        <div className="ud-surface ud-surface-glass ud-surface--lift rounded-xl border p-4 sm:p-6" style={{ borderColor: "var(--border-soft)", backgroundColor: "var(--card)" }}>
          <div className="mb-6 flex items-center">
            <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--foreground)]">System Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
              Clear Cache
            </button>
            <button className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
              Backup Data
            </button>
            <button className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-[var(--background-alt)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--foreground)] hover:brightness-95">
              System Logs
            </button>
            <button className="theme-transition flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--border-soft)] bg-rose-500/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-rose-500 hover:bg-rose-500/20">
              Reset Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
