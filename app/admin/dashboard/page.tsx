/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import {
  Smartphone,
  Fingerprint,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Cpu,
  Hash,
  Users,
  User,
  ChevronRight,
  LayoutDashboard,
  Settings,
  MoreHorizontal,
  ArrowUpRight,
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock
} from "lucide-react";

import UserLedgerView from "@/components/UserLedger";
import UserDongleView from "@/components/UserDongle";

export default function DongleIQAdminHub() {
  const [view, setView] = useState<"home" | "admin" | "ledger" | "dongle" | "settings">("home");
  const [admin, setAdmin] = useState<any>(null);
  const [, setLoadingAdmin] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/get-admin");
        const data = await res.json();
        if (data.success) setAdmin(data.admin);
      } catch (e) { console.error(e); } finally { setLoadingAdmin(false); }
    };
    fetchAdmin();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const csvContent = "data:text/csv;charset=utf-8,ApplicationID,Name,Status\nIRCTC-101,Vivek Shah,Pending";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `DongleIQ_User_Report.csv`);
      document.body.appendChild(link);
      link.click();
      setIsExporting(false);
    }, 1500);
  };

  const handleCreateReport = () => {
    alert(`Generating User Compliance Report...`);
  };

  return (
    <div className="min-h-screen bg-[#080b12] text-white font-sans flex overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 border-r border-[#1e2330] bg-[#080b12] hidden lg:flex flex-col p-6 h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-linear-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cpu size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Dongle <span className="text-purple-500">IQ</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem icon={<LayoutDashboard size={18}/>} label="Dashboard" active={view === "home"} onClick={() => setView("home")} />
          <div className="pt-4 pb-2 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Modules</div>
          <NavItem icon={<Users size={18}/>} label="User Ledger" active={view === "ledger"} onClick={() => setView("ledger")} />
          <NavItem icon={<Fingerprint size={18}/>} label="User Dongle" active={view === "dongle"} onClick={() => setView("dongle")} />
          <NavItem icon={<User size={18}/>} label="Admin Profile" active={view === "admin"} onClick={() => setView("admin")} />
        </nav>

        <div className="mt-auto pt-6 border-t border-[#1e2330]">
          <NavItem icon={<Settings size={18}/>} label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
          <div className="flex items-center gap-3 mt-6 p-2 rounded-xl bg-[#121620] border border-[#1e2330]">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-xs uppercase">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-500 truncate">{admin?.role || "Manager"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#080b12]">
        <header className="px-8 pt-8 flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {admin?.name?.split(" ")[0] || "Admin"}</h1>
            <p className="text-sm text-slate-400 mt-1">Manage IRCTC DSC applications and hardware status.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="flex items-center gap-2 bg-[#121620] border border-[#1e2330] px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#1e2330] transition-all">
              {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Export data
            </button>
            <button onClick={handleCreateReport} className="bg-purple-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all">
              Create report
            </button>
          </div>
        </header>

        <div className="px-8 pb-10">
          {view === "home" && (
            <>
              {/* --- UPDATED STAT CARDS --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Users" value="2,845" trend="+12.5%" icon={<Users size={14} />} color="green" />
                <StatCard label="Pending Review" value="142" trend="Action Required" icon={<Clock size={14} />} color="red" />
                <StatCard label="Active Accounts" value="2,610" trend="Verified" icon={<CheckCircle2 size={14} />} color="green" />
                <StatCard label="Rejected" value="93" trend="-2.4%" icon={<XCircle size={14} />} color="red" />
              </div>

              {/* --- UPDATED MAIN DATA SECTION --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#121620] border border-[#1e2330] rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-10">
                    <div>
                      <p className="text-sm text-slate-400">Total Enrollment History</p>
                      <h3 className="text-3xl font-bold mt-1">2.8K <span className="text-xs text-green-500 font-normal bg-green-500/10 px-2 py-1 rounded-lg ml-2">+14% Growth</span></h3>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                       <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> Active</span>
                       <span className="flex items-center gap-2 text-slate-500"><div className="w-2 h-2 rounded-full bg-cyan-400" /> Pending</span>
                    </div>
                  </div>
                  <div className="h-64 w-full bg-linear-to-t from-purple-500/5 to-transparent rounded-xl border-b border-l border-[#1e2330] relative overflow-hidden">
                     <svg className="absolute bottom-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,80 Q25,20 50,60 T100,30 L100,100 L0,100 Z" fill="url(#purpleGrad)" />
                        <defs>
                          <linearGradient id="purpleGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                     </svg>
                  </div>
                </div>

                <div className="bg-[#121620] border border-[#1e2330] rounded-2xl p-6 flex flex-col justify-between">
                   <div>
                     <div className="flex justify-between items-start mb-6">
                        <p className="text-sm text-slate-400">Approval Rate</p>
                        <MoreHorizontal className="text-slate-500 cursor-pointer" />
                     </div>
                     <h3 className="text-3xl font-bold">94.2% <span className="text-xs text-green-500 font-normal bg-green-500/10 px-2 py-1 rounded-lg ml-2">Standard</span></h3>
                   </div>
                   
                   <div className="mt-8 flex items-end gap-1 h-32">
                      {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
                        <div key={i} style={{ height: `${h}%` }} className="flex-1 bg-cyan-400/20 rounded-t-sm hover:bg-cyan-400 transition-all cursor-pointer" />
                      ))}
                   </div>

                   <button onClick={() => setView("ledger")} className="w-full text-center text-purple-500 text-xs font-bold mt-8 hover:text-purple-400 transition-colors">
                     View full ledger
                   </button>
                </div>
              </div>
            </>
          )}

          {view === "admin" && (
            <div className="bg-[#121620] border border-[#1e2330] rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 text-xs font-bold transition-all">
                <ArrowLeft size={16} /> Back to dashboard
              </button>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h2 className="text-4xl font-bold mb-2">{admin?.name || "Jyoti Verma"}</h2>
                  <p className="text-purple-500 font-bold text-sm mb-10">System Administrator — Dongle IQ</p>
                  <div className="space-y-4">
                    <DetailItem label="Internal ID" value={admin?._id} icon={<Hash size={16}/>} />
                    <DetailItem label="Secure Email" value={admin?.email} icon={<Mail size={16}/>} />
                    <DetailItem label="Contact No." value={admin?.number} icon={<Smartphone size={16}/>} />
                    <DetailItem label="Access Status" value={admin?.status || "Authorized"} icon={<ShieldCheck size={16}/>} />
                  </div>
                </div>
                <div className="bg-[#080b12] rounded-2xl p-8 border border-[#1e2330] flex flex-col justify-center items-center text-center">
                  <p className="text-slate-500 text-xs uppercase font-black tracking-[0.2em] mb-4">Active Session Key</p>
                  <div className="text-6xl font-black text-white tracking-tighter mb-4">{admin?.otp || "----"}</div>
                  <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2">
                    <CheckCircle2 size={12} /> Hardware Authenticated
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === "settings" && (
            <div className="bg-[#121620] border border-[#1e2330] rounded-3xl p-8">
              <button onClick={() => setView("home")} className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 text-xs font-bold transition-all"><ArrowLeft size={16} /> Back</button>
              <h2 className="text-2xl font-bold mb-6">System Settings</h2>
              <div className="max-w-2xl space-y-4">
                <div className="p-4 bg-[#080b12] rounded-xl border border-[#1e2330] flex justify-between items-center">
                  <p className="font-bold text-sm">Require Dongle for Login</p>
                  <div className="w-10 h-5 bg-purple-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"/></div>
                </div>
              </div>
            </div>
          )}

          {view === "ledger" && <UserLedgerView onBack={() => setView("home")} />}
          {view === "dongle" && <UserDongleView onBack={() => setView("home")} />}
        </div>
      </main>
    </div>
  );
}

// --- DASHBOARD COMPONENTS ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group ${active ? "bg-purple-500/10 text-purple-500" : "text-slate-400 hover:text-white hover:bg-[#121620]"}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={14} className={`${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
    </div>
  );
}

function StatCard({ label, value, trend, icon, color }: any) {
  const isGreen = color === "green";
  return (
    <div className="bg-[#121620] border border-[#1e2330] p-6 rounded-2xl hover:border-slate-700 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
          {icon} {label}
        </div>
        <MoreHorizontal size={16} className="text-slate-600 cursor-pointer" />
      </div>
      <div className="flex items-end justify-between">
        <h4 className="text-2xl font-bold">{value}</h4>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${isGreen ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
          {trend} <ArrowUpRight size={10} className={!isGreen ? "rotate-90" : ""} />
        </span>
      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-4 bg-[#080b12] border border-[#1e2330] p-4 rounded-xl">
      <div className="text-slate-500">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-none mb-1">{label}</p>
        <p className="text-sm font-bold truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}