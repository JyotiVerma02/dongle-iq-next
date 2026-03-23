"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  ShieldAlert, 
  Database, 
  HardDrive, 
  Activity,
  ChevronRight,
  Filter
} from "lucide-react";

interface Dongle {
  id: string;
  serialNumber: string;
  model: string;
  firmware: string;
  status: "Active" | "Maintenance" | "Revoked";
  assignedTo: string;
  lastSync: string;
}

export default function UserDongleView({ onBack }: { onBack: () => void }) {
  const [searchTerm, setSearchTerm] = useState("");

  const dongles: Dongle[] = [
    { id: "1", serialNumber: "DIQ-8829-X1", model: "v4.2 Pro", firmware: "v1.0.8", status: "Active", assignedTo: "Ravi Kaliya", lastSync: "2 mins ago" },
    { id: "2", serialNumber: "DIQ-1102-B2", model: "v3.0 Std", firmware: "v2.1.0", status: "Maintenance", assignedTo: "Unassigned", lastSync: "14 hrs ago" },
    { id: "3", serialNumber: "DIQ-4491-Z9", model: "v4.2 Pro", firmware: "v1.0.8", status: "Revoked", assignedTo: "Amit Singh", lastSync: "3 days ago" },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* --- TOP NAVIGATION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-4 font-black text-[9px] tracking-[0.2em] transition-all uppercase"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Return to Hub
          </button>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            Hardware <span className="text-blue-600 not-italic">Vault</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Dongle Registry & Firmware Management</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text"
              placeholder="SEARCH SERIAL OR ASSIGNEE..."
              className="w-full bg-white/80 backdrop-blur-md border border-slate-200 pl-12 pr-4 py-3 rounded-2xl text-[11px] font-bold tracking-wider focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatTile icon={<HardDrive size={14}/>} label="Total Units" value="1,284" />
        <StatTile icon={<Activity size={14}/>} label="Active Sync" value="942" color="text-emerald-500" />
        <StatTile icon={<ShieldAlert size={14}/>} label="Revoked" value="12" color="text-rose-500" />
        <StatTile icon={<RefreshCw size={14}/>} label="Updates Pending" value="48" color="text-amber-500" />
      </div>

      {/* --- HARDWARE TABLE --- */}
      <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.02)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Hardware Serial</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Model/Firmware</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Current Status</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Assignee</th>
              <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Sync</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {dongles.map((dongle) => (
              <tr key={dongle.id} className="group hover:bg-white transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-blue-400 shadow-lg">
                      <Cpu size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-800 tracking-tight">{dongle.serialNumber}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-[11px] font-bold text-slate-700">{dongle.model}</p>
                  <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Build {dongle.firmware}</p>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={dongle.status} />
                </td>
                <td className="px-8 py-6 text-[11px] font-bold text-slate-600">{dongle.assignedTo}</td>
                <td className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-tighter">{dongle.lastSync}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Hardware Layer Secure — End-to-End Encrypted</p>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StatTile({ icon, label, value, color = "text-slate-800" }: any) {
  return (
    <div className="bg-white/60 backdrop-blur-md border border-white p-5 rounded-3xl shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-slate-400">
        {icon}
        <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-2xl font-black tracking-tighter ${color}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Active: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Maintenance: "bg-amber-50 text-amber-600 border-amber-100",
    Revoked: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <span className={`px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${styles[status]}`}>
      {status}
    </span>
  );
}