/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  FileText,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

type User = {
  _id: string;
  name: string;
  pan: string;
  email: string;
  city: string;
  mobile: string;
  status: string;
  price: number;
  pid?: string; // Added for DSC context
};

export default function UserLedgerView({ onBack }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/get-users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#080b12] text-white animate-in fade-in duration-500">
      
      {/* --- HEADER --- */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button 
            onClick={onBack} 
            className="group flex items-center gap-2 text-slate-500 hover:text-purple-500 font-bold text-xs uppercase tracking-widest transition-all mb-4"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Console
          </button>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <FileText className="text-purple-500" /> DSC User Ledger
          </h2>
          <p className="text-slate-400 text-sm mt-1">Manage and track all Digital Signature Certificate applications.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#121620] border border-[#1e2330] p-2.5 rounded-xl text-slate-400 hover:text-white transition-all">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 bg-[#121620] border border-[#1e2330] px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1e2330] transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- TOP SUMMARY CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MiniStat label="Total Applications" value={users.length} icon={<UserCheck className="text-purple-500" />} />
        <MiniStat label="Approved DSCs" value={users.filter(u => u.status === 'APPROVED').length} icon={<CheckCircle2 className="text-green-500" />} />
        <MiniStat label="Pending KYC" value={users.filter(u => u.status !== 'APPROVED').length} icon={<Clock className="text-amber-500" />} />
      </div>

      {/* --- TABLE CONTAINER --- */}
      <div className="bg-[#121620] border border-[#1e2330] rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Table Search Header */}
        <div className="p-6 border-b border-[#1e2330] flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search by Name, PAN or Application ID..." 
              className="w-full bg-[#080b12] border border-[#1e2330] rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-purple-500 transition-all"
            />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Showing <span className="text-white">{users.length}</span> Records
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0d111a] text-slate-500">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Applicant Details</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Identity (PAN)</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Email Route</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]">Revenue</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2330]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Decrypting Ledger...</p>
                  </td>
                </tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 font-bold text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium tracking-tight">PID-{u._id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-300 bg-[#080b12] px-2 py-1 rounded-md border border-[#1e2330]">
                        {u.pan || "NOT PROVIDED"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-medium italic">{u.email}</td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-300 uppercase">{u.city || "---"}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-white">₹{u.price}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-600 hover:text-white transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-600 font-bold uppercase text-xs tracking-widest">
                    No DSC Applications Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MiniStat({ label, value, icon }: any) {
  return (
    <div className="bg-[#121620] border border-[#1e2330] p-5 rounded-2xl flex items-center gap-4">
      <div className="p-3 bg-[#080b12] rounded-xl border border-[#1e2330]">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase();
  if (s === "APPROVED") {
    return (
      <span className="inline-flex items-center px-2.5 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg text-[10px] font-black uppercase tracking-tight">
        <CheckCircle2 size={10} className="mr-1.5" /> Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg text-[10px] font-black uppercase tracking-tight">
      <AlertCircle size={10} className="mr-1.5" /> {status || "Pending"}
    </span>
  );
}