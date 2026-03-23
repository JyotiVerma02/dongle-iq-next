"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Users, FileText, ChevronRight, Search, 
  Download, Landmark, Smartphone, Zap, Fingerprint, 
  ShieldCheck, ArrowLeft, Mail, CreditCard, Cpu 
} from "lucide-react";

// --- TYPES ---
type Agent = {
  _id: string;
  name: string;
  email: string;
  status: "Approved" | "Pending" | "Rejected";
  dongleId: string;
  bankName: string;
  accountNo: string;
  ifsc: string;
  operator: string;
  simSerial: string;
  regDate: string;
};

export default function DongleIQAdminHub() {
  const [view, setView] = useState<"home" | "table" | "details" | "admin">("home");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const mockData: Agent[] = [
      {
        _id: "1", name: "Jyoti Verma", email: "jyoti@dongleiq.com", status: "Approved",
        dongleId: "DSC-8829-X", bankName: "HDFC Bank", accountNo: "50100422...", 
        ifsc: "HDFC0001", operator: "Airtel IQ", simSerial: "8991...", regDate: "2024-03-20"
      },
      {
        _id: "2", name: "Amit Sharma", email: "amit@tech.in", status: "Pending",
        dongleId: "DSC-1102-Q", bankName: "ICICI", accountNo: "9122...", 
        ifsc: "ICIC0002", operator: "Jio Fiber", simSerial: "8992...", regDate: "2024-03-21"
      }
    ];
    setAgents(mockData);
  }, []);

  // --- PAGE 1: COMMAND CENTER ---
  if (view === "home") {
    return (
      <div className="p-10 bg-slate-50 min-h-screen font-sans">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
            Dongle <span className="text-blue-600 italic text-4xl">IQ</span> Hub
          </h1>
          <p className="text-slate-500 font-medium">Digital Signature Certificate Infrastructure Management</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MenuCard 
            title="Admin Profile" 
            desc="Manage system-wide permissions, security keys, and administrative credentials."
            icon={<ShieldCheck size={32} />}
            onClick={() => setView("admin")}
          />
          <MenuCard 
            title="User Profile" 
            desc="Access the master ledger of all registered agents and their current verification status."
            icon={<Users size={32} />}
            onClick={() => setView("table")}
          />
          <MenuCard 
            title="User Dongle" 
            desc="Technical vault for hardware serials, firmware versions, and SIM integrations."
            icon={<Cpu size={32} />}
            onClick={() => setView("table")}
          />
        </div>
      </div>
    );
  }

  // --- NEW PAGE: ADMIN DETAILS ---
if (view === "admin") {
    // This is the data object based on your database record
    const raviProfile = {
      _id: "69bbc4118f66fba161167eec",
      name: "Ravi Kaliya",
      email: "ravi.k@webshlok.com",
      number: "7835025024",
      role: "admin",
      isVerified: true,
      status: "pending",
      otp: "306940",
      createdAt: "2026-03-19T09:38:25.704Z"
    };

    return (
      <div className="p-10 bg-slate-950 min-h-screen text-white font-sans">
        <button 
          onClick={() => setView("home")} 
          className="flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 font-black text-[10px] tracking-[0.3em] transition-all"
        >
          <ArrowLeft size={14} /> EXIT SECURE TERMINAL
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="bg-slate-900/50 border border-slate-800 p-12 rounded-[56px] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            {/* Background Decorative Element */}
            <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12">
              <ShieldCheck size={300} />
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-10 mb-12 relative z-10">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-[40px] flex items-center justify-center shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
                  <User size={60} strokeWidth={2.5} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-2 rounded-xl border-4 border-slate-900">
                  <Fingerprint size={20} className="text-white" />
                </div>
              </div>

              <div className="text-center md:text-left">
                <h2 className="text-5xl font-black tracking-tighter mb-3">{raviProfile.name}</h2>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <span className="px-4 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase rounded-full tracking-widest">
                    System {raviProfile.role}
                  </span>
                  <span className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> 
                    {raviProfile.isVerified ? "Verified Identity" : "Unverified"}
                  </span>
                </div>
              </div>
            </div>

            {/* Grid of Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
              <AdminDetailBox label="Registry ID" value={raviProfile._id} icon={<Hash size={14}/>} />
              <AdminDetailBox label="Email Endpoint" value={raviProfile.email} icon={<Mail size={14}/>} />
              <AdminDetailBox label="Contact Number" value={raviProfile.number} icon={<Smartphone size={14}/>} />
              <AdminDetailBox label="Verification Status" value={raviProfile.status.toUpperCase()} icon={<ShieldCheck size={14}/>} />
              <AdminDetailBox label="Active Session OTP" value={raviProfile.otp} icon={<Zap size={14}/>} />
              <AdminDetailBox label="Created At" value={new Date(raviProfile.createdAt).toLocaleDateString()} icon={<Calendar size={14}/>} />
            </div>

            {/* Security Note */}
            <div className="mt-10 p-6 bg-blue-600/5 rounded-3xl border border-blue-500/10 text-center">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                Last system update: {new Date().toLocaleTimeString()} — All actions are logged under Admin ID {raviProfile._id.slice(-6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

// Add this helper component outside your main component
function AdminDetailBox({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-3xl hover:border-blue-500/40 transition-all group">
      <div className="flex items-center gap-2 mb-2 text-slate-500 group-hover:text-blue-400 transition-colors">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-200 truncate">{value}</p>
    </div>
  );
}

  // ... (Rest of your Table and Detail views remain the same)
}

// --- UPDATED SUB-COMPONENT WITH HOVER EFFECTS ---

function MenuCard({ title, desc, icon, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="group relative bg-white border border-slate-200 p-9 rounded-[40px] cursor-pointer 
                 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                 hover:border-blue-500/30 hover:-translate-y-4 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.15)]
                 overflow-hidden"
    >
      {/* Decorative Blur Background */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="relative z-10 bg-slate-50 text-blue-600 w-16 h-16 rounded-[22px] flex items-center justify-center mb-8 
                      transition-all duration-500 group-hover:bg-blue-600 group-hover:text-white group-hover:rotate-12 group-hover:scale-110">
        {icon}
      </div>

      <h3 className="relative z-10 text-2xl font-black text-slate-900 mb-3 tracking-tighter group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="relative z-10 text-sm text-slate-500 leading-relaxed mb-10 font-medium">
        {desc}
      </p>

      <div className="relative z-10 flex items-center text-blue-600 font-black text-[10px] uppercase tracking-[0.25em] group-hover:translate-x-3 transition-transform duration-500">
        Access <ChevronRight size={14} className="ml-1" />
      </div>
    </div>
  );
}