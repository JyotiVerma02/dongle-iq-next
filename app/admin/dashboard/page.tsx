"use client";

export default function AdminDashboard() {
  return (
    <div
      className="min-h-screen flex items-center justify-center pt-14 relative overflow-hidden bg-cover bg-center bg-no-repeat bg-linear-to-br from-slate-900 via-slate-900 to-blue-950"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >

      {/* Glow effects */}
      <div className="absolute w-96 h-96 rounded-full blur-3xl -top-40 -left-40 bg-blue-500/20"></div>
      <div className="absolute w-96 h-96 rounded-full blur-3xl -bottom-40 -right-40 bg-indigo-500/20"></div>

      {/* Dashboard Card */}
      <div className="relative bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-[450px] border border-white/20 text-white overflow-hidden">

        {/* Shine animation */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shine_3s_infinite] pointer-events-none"></div>

        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

        <p className="text-gray-300 mb-6">
          Welcome Admin 🎉 You have successfully logged in.
        </p>

        <div className="space-y-3">

          <button className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-lg font-semibold">
            Manage Users
          </button>

          <button className="w-full bg-emerald-600 hover:bg-emerald-700 transition p-3 rounded-lg font-semibold">
            View Requests
          </button>

          <button className="w-full bg-purple-600 hover:bg-purple-700 transition p-3 rounded-lg font-semibold">
            Settings
          </button>

        </div>

      </div>

    </div>
  );
}