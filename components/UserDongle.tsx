/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeft, 
  Cpu, 
  Fingerprint, 
  ShieldCheck, 
  Smartphone, 
  FileText, 
  Image as ImageIcon,
  ExternalLink,
  CheckCircle
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
    <div className="min-h-screen bg-[#080b12] text-white animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="mb-6">
        <button 
          onClick={onBack} 
          className="group flex items-center gap-2 text-slate-500 hover:text-purple-500 font-bold text-[10px] uppercase tracking-[0.2em] transition-all mb-4"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Terminal
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
          <Cpu className="text-purple-500" size={24} /> eKYC & Dongle Vault
        </h2>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Decrypting Records...</p>
        </div>
      )}

      {/* GRID VIEW */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div 
              key={u._id} 
              className="bg-[#121620] border border-[#1e2330] rounded-2xl p-4 hover:border-purple-500/40 transition-all group"
            >
              {/* COMPACT CARD HEADER */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Fingerprint size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase truncate max-w-[140px]">
                      {u.name || "Unknown"}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                        {u.status || "Active"}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="text-slate-600 hover:text-purple-500 transition-colors">
                  <ExternalLink size={14} />
                </button>
              </div>

              {/* TECHNICAL DATA STRIPS */}
              <div className="space-y-1.5 mb-4">
                <CompactData label="eKYC ID" value={u.ekycId} icon={<ShieldCheck size={10}/>} />
                <CompactData label="Mobile" value={u.mobile} icon={<Smartphone size={10}/>} />
              </div>

              {/* DOCUMENT REPOSITORY - COMPACT */}
              <div className="bg-[#080b12] rounded-xl p-2.5 border border-[#1e2330]">
                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 border-b border-[#1e2330] pb-1">
                  Verified Attachments
                </p>
                <div className="grid grid-cols-1 gap-1">
                  <DocStrip label="Address" file={u.addressProof} icon={<FileText size={12}/>} />
                  <DocStrip label="ID Proof" file={u.idProof} icon={<ImageIcon size={12}/>} />
                  <DocStrip label="Photo" file={u.photo} icon={<CheckCircle size={12}/>} />
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-[8px] font-bold text-slate-700 tracking-widest">
                  REF: {u._id.slice(-6).toUpperCase()}
                </span>
                <button className="text-[9px] font-black text-purple-500 uppercase hover:text-white transition-colors">
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && users.length === 0 && (
        <div className="bg-[#121620] border border-[#1e2330] border-dashed p-12 rounded-3xl text-center">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Zero records found in vault</p>
        </div>
      )}
    </div>
  );
}

// --- REUSABLE COMPACT COMPONENTS ---

function CompactData({ label, value, icon }: any) {
  return (
    <div className="flex justify-between items-center bg-[#080b12]/50 px-2 py-1.5 rounded-lg border border-[#1e2330]/50">
      <span className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-1.5">
        {icon} {label}
      </span>
      <span className="text-[10px] font-bold text-slate-200 truncate ml-4">
        {value || "---"}
      </span>
    </div>
  );
}

function DocStrip({ label, file, icon }: any) {
  return (
    <div className="flex items-center justify-between py-1 px-1.5 hover:bg-white/[0.03] rounded transition-colors group/doc">
      <div className="flex items-center gap-2">
        <span className="text-slate-600 group-hover/doc:text-purple-500 transition-colors">
          {icon}
        </span>
        <span className="text-[9px] font-bold text-slate-400 truncate max-w-[110px]">
          {file || "No Upload"}
        </span>
      </div>
      {file && <span className="w-1 h-1 rounded-full bg-green-500" />}
    </div>
  );
}