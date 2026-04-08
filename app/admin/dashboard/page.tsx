/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Download,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Bell,
  Search,
  Globe
} from "lucide-react";

import UserLedgerView from "@/components/UserLedger";
import UserDongleView from "@/components/UserDongle";

export default function DongleIQAdminHub() {
  const [view, setView] = useState<"home" | "admin" | "ledger" | "dongle" | "settings">("home");
  const [admin, setAdmin] = useState<any>(null);
 
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await fetch("/api/get-admin");
        const data = await res.json();
        if (data.success) setAdmin(data.admin);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAdmin(false);
      }
    };
    fetchAdmin();
  }, []);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[#3b475c] bg-linear-to-br from-[#3b475c] via-[#282f3a] to-[#21262f] text-slate-100 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1a1f29]/95 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative lg:translate-x-0 flex flex-col`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-[#45c3b9] rounded-xl flex items-center justify-center shadow-lg shadow-[#45c3b9]/20">
              <Globe className="text-[#1a1f29]" size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">Dongle <span className="text-[#45c3b9]">IQ</span></h1>
          </div>

          <nav className="space-y-2">
            <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={view === "home"} onClick={() => setView("home")} />
            <div className="pt-6 pb-2 px-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Management</div>
            <NavItem icon={<Users size={20} />} label="User Ledger" active={view === "ledger"} onClick={() => setView("ledger")} />
            <NavItem icon={<Fingerprint size={20} />} label="User Dongle" active={view === "dongle"} onClick={() => setView("dongle")} />
            <NavItem icon={<User size={20} />} label="Admin Profile" active={view === "admin"} onClick={() => setView("admin")} />
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4">
          <NavItem icon={<Settings size={20} />} label="Settings" active={view === "settings"} onClick={() => setView("settings")} />
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all">
            <div className="w-10 h-10 rounded-full border-2 border-[#45c3b9] bg-slate-800 flex items-center justify-center font-black text-xs">
              {admin?.name?.charAt(0) || "A"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate">{admin?.name || "Admin"}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{admin?.role || "Manager"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* TOP NAV BAR */}
        <header className="h-24 flex items-center justify-between px-8 bg-transparent border-b border-white/5">
          <div className="flex items-center gap-4 flex-1">
             <div className="hidden md:flex items-center gap-3 bg-[#1a1f29] border border-white/5 rounded-full px-5 py-2.5 w-96 shadow-xl">
                <Search size={16} className="text-slate-500" />
                <input type="text" placeholder="Search system registry..." className="bg-transparent text-xs outline-none w-full text-white placeholder:text-slate-600 font-medium" />
             </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> System Online
            </div>
            <button className="relative p-3 bg-[#1a1f29] border border-white/5 rounded-xl text-slate-400 hover:text-[#45c3b9] transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#f4cc4d] rounded-full border-2 border-[#1a1f29]" />
            </button>
          </div>
        </header>

        {/* VIEWPORT */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          {view === "home" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">Admin <span className="font-light text-slate-400">Hub</span></h2>
                  <p className="text-slate-500 text-sm font-medium mt-1">Manage IRCTC DSC applications and hardware status.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleExport} className="bg-[#1a1f29] border border-white/5 px-6 py-3 rounded-xl font-bold text-xs text-slate-300 hover:bg-[#2c323c] transition-all flex items-center gap-2 shadow-lg">
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
                    Export Data
                  </button>
                  <button className="bg-[#45c3b9] text-[#1a1f29] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#3ba39b] shadow-xl shadow-[#45c3b9]/10 transition-all">
                    Create Report
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                <StatCard label="Total Users" value="2,845" trend="+12.5%" icon={<Users />} color="teal" />
                <StatCard label="Pending Review" value="142" trend="Action" icon={<Clock />} color="orange" />
                <StatCard label="Active Accounts" value="2,610" trend="Verified" icon={<CheckCircle2 />} color="teal" />
                <StatCard label="Rejected" value="93" trend="-2.4%" icon={<XCircle />} color="red" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1a1f29] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl">
                  <div className="flex justify-between items-center mb-12">
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Enrollment History</p>
                      <h3 className="text-4xl font-black mt-2">2.8K <span className="text-xs text-[#45c3b9] bg-[#45c3b9]/10 px-3 py-1 rounded-full ml-3 font-bold tracking-normal">+14%</span></h3>
                    </div>
                  </div>
                  <div className="h-64 w-full flex items-end justify-between px-2 gap-2">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#45c3b9]/10 rounded-t-xl relative group transition-all" style={{ height: `${h}%` }}>
                        <div className="absolute inset-0 bg-linear-to-t from-[#45c3b9]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1f29] border border-white/5 rounded-[2.5rem] p-10 shadow-2xl flex flex-col">
                  <h4 className="text-[10px] font-black text-[#f4cc4d] uppercase tracking-[0.2em] mb-10">Compliance Rate</h4>
                  <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                       <svg className="w-full h-full -rotate-90">
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/5" />
                          <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="440" strokeDashoffset="44" className="text-[#45c3b9]" />
                       </svg>
                       <span className="absolute text-3xl font-black">94%</span>
                    </div>
                    <p className="text-slate-500 text-xs font-bold mt-8 uppercase tracking-widest text-center leading-relaxed">System Standards<br/>Operating at peak</p>
                  </div>
                  <button onClick={() => setView("ledger")} className="w-full py-4 mt-8 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#45c3b9] transition-all">
                    Open Full Ledger
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "admin" && (
            <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
               <button onClick={() => setView("home")} className="group flex items-center gap-2 text-slate-500 hover:text-white font-bold text-xs transition-all mb-10">
                 <ArrowLeft size={16} /> Back to Dashboard
               </button>
               <div className="bg-[#1a1f29] border border-white/5 rounded-[3rem] p-12 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#45c3b9]/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                     <div>
                        <h2 className="text-5xl font-black text-white tracking-tighter mb-2">{admin?.name || "Jyoti Verma"}</h2>
                        <p className="text-[#45c3b9] font-black text-xs uppercase tracking-[0.3em] mb-12">Security Administrator</p>
                        <div className="space-y-4">
                           <DetailItem label="Internal UID" value={admin?._id || "IDX-9920"} icon={<Hash />} />
                           <DetailItem label="Secure Channel" value={admin?.email || "admin@dongleiq.com"} icon={<Mail />} />
                           <DetailItem label="Work Endpoint" value={admin?.number || "+91 98XXX XXXXX"} icon={<Smartphone />} />
                        </div>
                     </div>
                     <div className="bg-[#1f232c] border border-white/5 rounded-[2.5rem] p-10 flex flex-col justify-center items-center text-center shadow-inner">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">Live Session Key</p>
                        <div className="text-7xl font-black text-white tracking-tighter mb-6 font-mono text-glow">
                           {admin?.otp || "8821"}
                        </div>
                        <div className="bg-[#45c3b9]/10 text-[#45c3b9] px-6 py-2 rounded-full text-[10px] font-black uppercase flex items-center gap-2 border border-[#45c3b9]/20">
                           <ShieldCheck size={14} /> Identity Verified
                        </div>
                     </div>
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

// --- SUB-COMPONENTS ---

function NavItem({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
        active 
        ? "bg-white/5 text-[#45c3b9] border border-white/5 shadow-inner" 
        : "text-slate-500 hover:text-slate-300"
      }`}
    >
      <div className="flex items-center gap-4">
        {React.cloneElement(icon, { size: 20 })}
        <span className="text-sm font-bold">{label}</span>
      </div>
      <ChevronRight size={14} className={`${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-all`} />
    </button>
  );
}

function StatCard({ label, value, trend, icon, color }: any) {
  const colors = {
    teal: "text-[#45c3b9] bg-[#45c3b9]/10",
    orange: "text-[#f4cc4d] bg-[#f4cc4d]/10",
    red: "text-[#e15967] bg-[#e15967]/10",
  };
  
  return (
    <div className="bg-[#1a1f29] border border-white/5 p-8 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colors[color as keyof typeof colors]}`}>
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${colors[color as keyof typeof colors]} border-white/5`}>
          {trend}
        </span>
      </div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
    </div>
  );
}

function DetailItem({ label, value, icon }: any) {
  return (
    <div className="flex items-center gap-5 bg-white/5 border border-white/5 p-5 rounded-2xl hover:bg-white/10 transition-all cursor-default">
      <div className="w-12 h-12 bg-[#1a1f29] rounded-xl flex items-center justify-center text-slate-500 group-hover:text-[#45c3b9]">
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <div className="overflow-hidden">
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-200 truncate">{value || "N/A"}</p>
      </div>
    </div>
  );
}