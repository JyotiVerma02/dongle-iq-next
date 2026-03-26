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

export default function UserLedgerView({ onBack }: any) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch users from API
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
    <div className="max-w-7xl mx-auto p-4 lg:p-8 bg-[#f8fbff] min-h-screen">
      {/* High-Contrast Back Button */}
      <button 
        onClick={onBack} 
        className="mb-8 flex items-center gap-2 text-[#2c8ed3] hover:text-[#1a5f8d] font-black uppercase text-sm tracking-tight transition-all group"
      >
        <span className="text-xl group-hover:-translate-x-1 transition-transform">⬅</span> 
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black text-black tracking-tighter border-l-6 border-[#2c8ed3] pl-5 uppercase">
          User Ledger
        </h2>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <span className="text-gray-500 font-bold text-xs uppercase mr-2">Total Records:</span>
          <span className="text-[#2c8ed3] font-black">{users.length}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#2c8ed3]"></div>
          <p className="mt-4 text-black font-black uppercase text-sm tracking-widest">Loading Ledger...</p>
        </div>
      )}

      {/* Table Container - Stronger Shadow & Border */}
      {!loading && (
        <div className="overflow-hidden bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2c8ed3] text-white">
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">Name</th>
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">PAN</th>
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">Email</th>
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">City</th>
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">Status</th>
                <th className="p-4 text-[12px] font-black uppercase tracking-widest border-b border-blue-600">Price</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {users.length > 0 ? (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="p-4 text-black font-bold text-sm uppercase tracking-tight">
                      {u.name || "N/A"}
                    </td>
                    <td className="p-4 text-gray-900 font-mono font-bold text-sm">
                      {u.pan || "-------"}
                    </td>
                    <td className="p-4 text-gray-700 font-medium text-sm">
                      {u.email}
                    </td>
                    <td className="p-4 text-gray-800 font-bold text-sm uppercase">
                      {u.city || "---"}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[11px] font-black uppercase tracking-tighter">
                        <span className="w-2 h-2 rounded-full bg-amber-500 mr-2 animate-pulse"></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-green-700 font-black text-base">
                        ₹{u.price}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                    No users found in ledger
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}