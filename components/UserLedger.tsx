/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Download, FileText,
  
  Clock, CheckCircle2, X, ShieldCheck, 
 
  MapPin, Calendar, Smartphone, Mail, Hash, CreditCard,
  Eye, Ban, ExternalLink, Settings
} from "lucide-react";

// --- TYPES ---
interface User {
  _id: string;
  name: string;
  email: string;
  number: string;
  role: string;
  status: string;
  isVerified: boolean;
  isAadhaarVerified: boolean;
  city: string;
  state: string;
  address: string;
  pincode: string;
  dob: string;
  gender: string;
  pan: string;
  certType: string;
  certificateClass: string;
  validity: string;
  tokenType: string;
  price: number;
  ekycId: string;
  ekycPin: string;
  bpCode?: string;
  addressProof?: string;
  idProof?: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserLedgerProps {
  onBack: () => void;
}

interface ThemeStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: "teal" | "yellow" | "orange" | "red";
}

export default function UserLedgerView({ onBack }: UserLedgerProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/get-users");
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch (e) {
        console.error("Ledger Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      [u.name, u.pan, u.email].some(field => 
        field?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [users, searchQuery]);

  return (
    <div className="min-h-screen bg-[#3b475c] bg-linear-to-br from-[#3b475c] via-[#282f3a] to-[#21262f] text-slate-100 p-4 md:p-8 relative font-sans">
      
      {/* --- FLOATING UI ELEMENTS --- */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#252a33] rounded-full flex items-center justify-center text-slate-500 shadow-2xl z-50 hover:text-white transition-colors cursor-pointer">
        <Settings size={22} className="animate-spin" style={{ animationDuration: '8s' }} />
      </div>

      {/* --- HEADER --- */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
        <div>
          <button onClick={onBack} className="group flex items-center gap-2 text-slate-400 hover:text-white font-medium text-sm transition-all mb-3">
            <ArrowLeft size={16} /> Exit Dashboard
          </button>
          <h2 className="text-4xl font-black text-white leading-tight">
            Analytics <span className="font-light text-slate-400">Registry</span>
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search data..." 
              className="w-full lg:w-80 bg-[#1f232c] border border-[#2d3548] rounded-xl py-3 pl-12 text-sm text-white focus:outline-none focus:border-slate-500" 
            />
          </div>
          <button className="bg-[#1f232c] border border-[#2d3548] px-6 rounded-xl font-bold text-xs text-slate-300 hover:bg-[#2c323c] transition-all flex items-center gap-2 shadow-lg">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 px-4">
         <ThemeStatCard label="Total Applicants" value={users.length} icon={<FileText />} color="teal" />
         <ThemeStatCard label="KYC Verified" value={users.filter(u => u.isAadhaarVerified).length} icon={<ShieldCheck />} color="yellow" />
         <ThemeStatCard label="Review Queue" value={users.filter(u => u.status === 'pending').length} icon={<Clock />} color="orange" />
         <ThemeStatCard label="Total Revenue" value={`₹${users.reduce((a, b) => a + (b.price || 0), 0).toLocaleString()}`} icon={<CreditCard />} color="teal" />
      </div>

      {/* --- MAIN TABLE --- */}
      <div className="max-w-7xl mx-auto bg-[#1a1f29] border border-[#2d3548] rounded-4xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 border-b border-[#2d3548] bg-[#0d111a]/20">
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest">User Details</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-center">Security</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest">License Type</th>
                <th className="px-6 py-6 text-[11px] font-black uppercase tracking-widest text-right">Fee Paid</th>
                <th className="px-8 py-6 text-[11px] font-black uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3548]">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Accessing Secure Database...</td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-[#2d3548] flex items-center justify-center font-bold text-[#45c3b9]">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{u.name}</p>
                        <p className="text-[10px] text-slate-500 mt-1 uppercase font-mono">{u.pan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center gap-2">
                       <TrustIcon active={u.isVerified} label="Mail" />
                       <TrustIcon active={u.isAadhaarVerified} label="KYC" />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-xs font-bold text-slate-300">{u.certType}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{u.certificateClass}</p>
                  </td>
                  <td className="px-6 py-6 text-right font-black text-[#f4cc4d] text-sm">₹{u.price.toLocaleString()}</td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => setSelectedUser(u)} className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FULL SCREEN DETAIL OVERLAY --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-100 bg-[#1a1f29] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex-none h-24 border-b border-[#2d3548] flex items-center justify-between px-8 bg-[#1f232c]">
            <div className="flex items-center gap-6">
              <button onClick={() => setSelectedUser(null)} className="p-3 bg-[#1a1f29] hover:bg-[#2d3548] rounded-xl text-slate-400 transition-all">
                <ArrowLeft size={24} />
              </button>
              <div>
                <h3 className="text-2xl font-black text-white">{selectedUser.name}</h3>
                <StatusPill status={selectedUser.status} />
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-white/5 rounded-full text-slate-500">
              <X size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-16 custom-scrollbar">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2 space-y-12">
                <section>
                  <h4 className="text-[10px] font-black text-[#45c3b9] uppercase tracking-[0.4em] mb-8">Personal Records</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DetailCard icon={<Mail size={16}/>} label="Primary Email" value={selectedUser.email} />
                    <DetailCard icon={<Smartphone size={16}/>} label="Mobile" value={selectedUser.number} />
                    <DetailCard icon={<Calendar size={16}/>} label="DOB" value={selectedUser.dob} />
                    <DetailCard icon={<Hash size={16}/>} label="PAN" value={selectedUser.pan} />
                  </div>
                </section>
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8">Address Verification</h4>
                  <div className="bg-[#1f232c] p-8 rounded-4xl border border-[#2d3548]">
                    <p className="text-xl text-slate-200 font-medium leading-relaxed mb-6">{selectedUser.address}</p>
                    <div className="flex gap-3">
                      <span className="bg-black/20 px-4 py-1.5 rounded-full text-xs border border-[#2d3548]">{selectedUser.city}</span>
                      <span className="bg-black/20 px-4 py-1.5 rounded-full text-xs border border-[#2d3548]">{selectedUser.state}</span>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-8">
                <div className="bg-linear-to-b from-[#1f232c] to-[#1a1f29] p-8 rounded-[2.5rem] border border-[#2d3548] shadow-2xl">
                  <h4 className="text-[10px] font-black text-[#f4cc4d] uppercase tracking-[0.3em] mb-8">Config Stats</h4>
                  <div className="space-y-6">
                    <DetailRow label="Class" value={selectedUser.certificateClass} />
                    <DetailRow label="Type" value={selectedUser.certType} />
                    <DetailRow label="Price" value={`₹${selectedUser.price.toLocaleString()}`} highlight />
                    <DetailRow label="Validity" value={selectedUser.validity} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <DocBox label="ID Proof" fileName={selectedUser.idProof} />
                  <DocBox label="Live Photo" fileName={selectedUser.photo} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-none p-8 border-t border-[#2d3548] bg-[#1f232c] flex gap-4 justify-center">
            <button className="max-w-xs w-full bg-[#45c3b9] hover:bg-[#3ba39b] text-[#1a1f29] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#45c3b9]/10">
              APPROVE APPLICATION
            </button>
            <button className="max-w-xs w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 border border-red-500/20 transition-all">
              REJECT
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- MICRO COMPONENTS ---

function ThemeStatCard({ label, value, icon, color }: ThemeStatCardProps) {
  const colors = {
    teal: "text-[#45c3b9] bg-[#45c3b9]/10",
    yellow: "text-[#f4cc4d] bg-[#f4cc4d]/10",
    orange: "text-[#f2a15c] bg-[#f2a15c]/10",
    red: "text-[#e15967] bg-[#e15967]/10"
  };

  return (
    <div className="bg-[#1a1f29] border border-[#2d3548] p-7 rounded-4xl shadow-xl hover:scale-[1.02] transition-transform">
      <div className="flex justify-between items-start mb-6">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
       <div className={`p-3 rounded-xl ${colors[color]}`}>
  {React.isValidElement(icon) && 
    React.cloneElement(icon as React.ReactElement<{ size: number }>, { 
      size: 18 
    })
  }
</div>
      </div>
      <h3 className={`text-3xl font-black ${colors[color].split(' ')[0]}`}>{value}</h3>
    </div>
  );
}

function DetailCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#1f232c] border border-[#2d3548] p-6 rounded-2xl flex items-center gap-5">
      <div className="p-4 bg-[#1a1f29] rounded-2xl text-slate-500">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</p>
        <p className="text-sm font-bold truncate text-white">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center border-b border-[#2d3548]/50 pb-4 last:border-0 last:pb-0">
      <span className="text-[10px] font-black text-slate-500 uppercase">{label}</span>
      <span className={`text-sm font-bold ${highlight ? 'text-[#f4cc4d] text-lg' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

function DocBox({ label, fileName }: { label: string; fileName?: string }) {
  return (
    <div className="bg-[#1a1f29] border border-[#2d3548] p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-[#45c3b9]/50 transition-all">
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-10 h-10 bg-[#1f232c] rounded-lg flex items-center justify-center text-slate-500 group-hover:text-[#45c3b9]">
          <FileText size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-slate-500 uppercase">{label}</p>
          <p className="text-[10px] font-mono text-slate-400 truncate w-32">{fileName || "No attachment"}</p>
        </div>
      </div>
      <ExternalLink size={14} className="text-slate-600" />
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const isPending = status?.toLowerCase() === 'pending';
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase mt-2 border ${
      isPending ? "bg-[#f2a15c]/10 border-[#f2a15c]/20 text-[#f2a15c]" : "bg-[#45c3b9]/10 border-[#45c3b9]/20 text-[#45c3b9]"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isPending ? "bg-[#f2a15c] animate-pulse" : "bg-[#45c3b9]"}`} />
      {status}
    </div>
  );
}

function TrustIcon({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`px-2 py-0.5 rounded text-[8px] font-black border uppercase ${
      active ? "bg-[#45c3b9]/10 border-[#45c3b9]/20 text-[#45c3b9]" : "bg-[#e15967]/10 border-[#e15967]/20 text-[#e15967]"
    }`}>
      {label}
    </div>
  );
}