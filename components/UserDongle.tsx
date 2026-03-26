/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

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
    <div className="max-w-6xl mx-auto p-4 lg:p-8 bg-[#f8fbff] min-h-screen">
      {/* High-Contrast Back Button */}
      <button 
        onClick={onBack} 
        className="mb-8 flex items-center gap-2 text-[#2c8ed3] hover:text-[#1a5f8d] font-black uppercase text-sm tracking-tight transition-all group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">⬅</span> 
        Back to Dashboard
      </button>

      <h2 className="text-3xl font-black mb-8 text-black tracking-tighter border-l-6 border-[#2c8ed3] pl-5 uppercase">
        User Dongle Data
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#2c8ed3]"></div>
          <p className="mt-4 text-black font-black uppercase text-sm tracking-widest">Fetching Data...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && users.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow border border-dashed border-gray-300 text-center">
          <p className="text-gray-400 font-bold uppercase tracking-widest">No users found in database</p>
        </div>
      )}

      {/* Grid View */}
      <div className="grid md:grid-cols-2 gap-8">
        {users.map((u) => (
          <div key={u._id} className="bg-white p-6 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-gray-100 hover:border-[#2c8ed3] transition-all group">
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[11px] font-black text-[#2c8ed3] uppercase tracking-widest mb-1">Applicant Name</p>
                <p className="text-xl font-black text-black uppercase">{u.name || "UNNAMED USER"}</p>
              </div>
              <span className="bg-[#2c8ed3] text-white text-[10px] font-black px-2 py-1 rounded">ACTIVE</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-bold text-xs uppercase">eKYC ID</span>
                <span className="text-black font-black text-sm">{u.ekycId}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500 font-bold text-xs uppercase">Mobile</span>
                <span className="text-black font-black text-sm">{u.mobile}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-dashed border-gray-100">
              <p className="text-[11px] font-black text-[#2c8ed3] uppercase tracking-widest mb-3">Uploaded Documents</p>
              
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-lg">📄</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Address Proof</p>
                    <p className="text-[12px] font-bold text-black truncate max-w-[200px]">{u.addressProof || "Not Uploaded"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-lg">🆔</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none">ID Proof</p>
                    <p className="text-[12px] font-bold text-black truncate max-w-[200px]">{u.idProof || "Not Uploaded"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="text-lg">📸</span>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Applicant Photo</p>
                    <p className="text-[12px] font-bold text-black truncate max-w-[200px]">{u.photo || "Not Uploaded"}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}