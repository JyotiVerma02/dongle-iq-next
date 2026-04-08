
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Cpu,
  Fingerprint,
  ShieldCheck,
  Smartphone,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  CheckCircle,
  Search,
  Database
} from "lucide-react";

type User = {
  _id: string;
  name: string;
  pan: string;
  email: string;
  city: string;
  mobile: string;
  ekycId: string;
  addressProof: string;
  idProof: string;
  photo: string;
  price: number;
  status: string;
  address?: string;
  pin_code?: string;
  ekycPin?: string;
};

export default function UserDongleView({ onBack }: { onBack: () => void }) {
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all mb-6"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Return to Terminal
          </button>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-[#45c3b9]/10 rounded-2xl">
                <Cpu className="text-[#45c3b9]" size={32} />
            </div>
            eKYC <span className="font-light text-slate-400">& Dongle Vault</span>
          </h2>
        </div>

        <div className="flex items-center gap-4 bg-[#1a1f29] border border-white/5 rounded-2xl px-5 py-3 shadow-xl w-full md:w-80">
            <Search size={16} className="text-slate-500" />
            <input 
                type="text" 
                placeholder="Search encrypted vault..." 
                className="bg-transparent text-xs outline-none w-full text-white placeholder:text-slate-600 font-bold" 
            />
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="bg-[#1a1f29] border border-white/5 rounded-[3rem] py-32 flex flex-col items-center justify-center shadow-2xl">
          <div className="w-12 h-12 border-4 border-[#45c3b9]/10 border-t-[#45c3b9] rounded-full animate-spin mb-6" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
            Decrypting Secure Records...
          </p>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {users.map((u) => (
            <div
              key={u._id}
              className="bg-[#1a1f29] border border-white/5 rounded-[2.5rem] p-8 hover:border-[#45c3b9]/30 transition-all group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#45c3b9]/5 rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              {/* COMPACT CARD HEADER */}
              <div className="flex justify-between items-start mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[#45c3b9] shadow-inner">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight truncate max-w-37.5">
                      {u.name || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#45c3b9] shadow-[0_0_8px_rgba(69,195,185,0.5)] animate-pulse" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {u.status || "Authenticated"}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-[#45c3b9] hover:bg-white/10 transition-all">
                  <ExternalLink size={16} />
                </button>
              </div>

              {/* TECHNICAL DATA STRIPS */}
              <div className="space-y-3 mb-8 relative z-10">
                <CompactData
                  label="eKYC ID"
                  value={u.ekycId}
                  icon={<ShieldCheck size={12} />}
                />
                <CompactData
                  label="Endpoint"
                  value={u.mobile}
                  icon={<Smartphone size={12} />}
                />
              </div>

              {/* DOCUMENT REPOSITORY */}
              <div className="bg-[#0d111a]/40 rounded-3xl p-6 border border-white/5 relative z-10 shadow-inner">
                <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                    <Database size={12} className="text-slate-600" />
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Verified Attachments
                    </p>
                </div>
                <div className="space-y-1">
                  <DocStrip
                    label="Address Proof"
                    file={u.addressProof}
                    icon={<FileText size={14} />}
                  />
                  <DocStrip
                    label="Identity Doc"
                    file={u.idProof}
                    icon={<ImageIcon size={14} />}
                  />
                  <DocStrip
                    label="Biometric Photo"
                    file={u.photo}
                    icon={<CheckCircle size={14} />}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between items-center relative z-10">
                <span className="text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase">
                  Vault-Ref: {u._id.slice(-6).toUpperCase()}
                </span>
                <button className="text-[10px] font-black text-[#45c3b9] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                  Expand <ArrowLeft size={12} className="rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && users.length === 0 && (
        <div className="bg-[#1a1f29] border border-white/5 border-dashed py-32 rounded-[3rem] text-center shadow-2xl">
          <Database size={48} className="text-slate-700 mx-auto mb-6" />
          <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-xs">
            Zero encrypted records found in vault
          </p>
        </div>
      )}
    </div>
  );
}

// --- REUSABLE COMPACT COMPONENTS ---

function CompactData({ label, value, icon }: any) {
  return (
    <div className="flex justify-between items-center bg-white/5 px-4 py-3 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
      <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-3">
        <span className="text-[#45c3b9]">{icon}</span> {label}
      </span>
      <span className="text-xs font-bold text-slate-200 truncate ml-4 font-mono">
        {value || "---"}
      </span>
    </div>
  );
}

function DocStrip({ label, file, icon }: any) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-white/5 rounded-xl transition-all group/doc cursor-pointer">
      <div className="flex items-center gap-3">
        <span className="text-slate-600 group-hover/doc:text-[#45c3b9] transition-colors">
          {icon}
        </span>
        <span className="text-[10px] font-bold text-slate-400 group-hover/doc:text-slate-200 truncate max-w-30">
          {file ? label : "Missing Upload"}
        </span>
      </div>
      <div className={`w-1.5 h-1.5 rounded-full ${file ? "bg-[#45c3b9] shadow-[0_0_8px_rgba(69,195,185,0.4)]" : "bg-red-500/50"}`} />
    </div>
  );
}