
"use client";

import React, { useState } from "react";
import { 
  Search, Download, Filter, MoreHorizontal, 
  ArrowLeft, CheckCircle2, Clock, XCircle, 
  Eye, X, Calendar, Shield
} from "lucide-react";

type Agent = {
  _id: string;
  name: string;
  email: string;
  status: "Approved" | "Pending" | "Rejected";
  dongleId: string;
  regDate: string;
};

export default function UserLedgerView({ onBack }: { onBack: () => void }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const agents: Agent[] = [
    { _id: "1", name: "Jyoti Verma", email: "jyoti@dongleiq.com", status: "Approved", dongleId: "DSC-8829-X", regDate: "2024-03-20" },
    { _id: "2", name: "Amit Sharma", email: "amit@tech.in", status: "Pending", dongleId: "DSC-1102-Q", regDate: "2024-03-21" },
    { _id: "3", name: "Rohan Das", email: "rohan.d@webshlok.com", status: "Approved", dongleId: "DSC-4492-P", regDate: "2024-03-22" },
    { _id: "4", name: "Sanya Malhotra", email: "sanya@it.org", status: "Rejected", dongleId: "DSC-9901-Z", regDate: "2024-03-18" },
  ];

  return (
    <div className="max-w-7xl mx-auto relative">
      
      {/* --- FILTER SIDEBAR (Overlay) --- */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white/80 backdrop-blur-2xl border-l border-white shadow-[-20px_0_50px_rgba(0,0,0,0.05)] z-50 transform transition-transform duration-500 ease-in-out ${isFilterOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Filter Ledger</h3>
            <button onClick={() => setIsFilterOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-8">
            {/* Status Filter */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Shield size={12} /> DSC Status
              </label>
              <div className="space-y-2">
                {['Approved', 'Pending', 'Rejected'].map((status) => (
                  <label key={status} className="flex items-center gap-3 p-3 bg-white/50 border border-slate-100 rounded-2xl cursor-pointer hover:border-blue-300 transition-all group">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600">{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                <Calendar size={12} /> Registration Date
              </label>
              <input type="date" className="w-full bg-white/50 border border-slate-100 rounded-2xl p-3 text-xs font-bold text-slate-600 outline-none focus:border-blue-400" />
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all">
              Apply Filters
            </button>
            <button className="w-full text-slate-400 text-[9px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* --- TOP ACTIONS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 font-black text-[9px] tracking-[0.2em] transition-all uppercase"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search agents..." 
              className="w-full bg-white/60 border border-white rounded-2xl py-2.5 pl-12 pr-4 text-sm font-medium outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className={`p-2.5 rounded-2xl transition-all border ${isFilterOpen ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-white text-slate-600 shadow-sm hover:border-blue-200'}`}
          >
            <Filter size={18} />
          </button>
          <button className="bg-slate-900 text-white p-2.5 rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* --- TABLE (Same as previous, wrapped in a div to handle the sidebar blur) --- */}
      <div className={`bg-white/70 backdrop-blur-3xl border border-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.02)] overflow-hidden transition-all duration-500 ${isFilterOpen ? 'blur-sm scale-[0.98] opacity-50 pointer-events-none' : ''}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Agent Identity</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Registry ID</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Auth Status</th>
                <th className="px-8 py-5 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Reg. Date</th>
                <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {agents.map((agent) => (
                <tr key={agent._id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 tracking-tight">{agent.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 tracking-tighter">{agent.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-[11px] font-black text-slate-500 font-mono tracking-wider bg-slate-100/50 px-2 py-1 rounded-md">{agent.dongleId}</span>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[12px] font-bold text-slate-600 tracking-tighter">{agent.regDate}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"><MoreHorizontal size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Agent["status"] }) {
  const styles = {
    Approved: "bg-emerald-50 text-[#16a34a] border-emerald-100",
    Pending: "bg-amber-50 text-amber-600 border-amber-100",
    Rejected: "bg-rose-50 text-rose-600 border-rose-100",
  };
  const icons = {
    Approved: <CheckCircle2 size={12} />,
    Pending: <Clock size={12} />,
    Rejected: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
}