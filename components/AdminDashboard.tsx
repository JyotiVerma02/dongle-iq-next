import { useState } from "react";

export default function Admin() {
  const [applications, setApplications] = useState(() => {
    try {
      const data = JSON.parse(localStorage.getItem("dongleApplications")) || [];
      return data;
    } catch (error) {
      console.error("Failed to load applications:", error);
      return [];
    }
  });
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const updateStatus = (id, newStatus) => {
    const updated = applications.map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    setApplications(updated);
    localStorage.setItem("dongleApplications", JSON.stringify(updated));
  };

  const deleteApplication = (id) => {
    const filtered = applications.filter((app) => app.id !== id);
    setApplications(filtered);
    localStorage.setItem("dongleApplications", JSON.stringify(filtered));
  };

  const filteredApplications = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    return (
      app.firstName.toLowerCase().includes(term) ||
      app.lastName.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.mobileNumber.includes(term) ||
      app.id.toString().includes(term)
    );
  });

  const total = applications.length;
  const pending = applications.filter((a) => a.status === "Pending").length;
  const approved = applications.filter((a) => a.status === "Approved").length;
  const rejected = applications.filter((a) => a.status === "Rejected").length;

  return (
    <div className="fixed inset-0 flex flex-col bg-black overflow-hidden animated-bg">
      <div className="absolute w-125 h-125 bg-pink-500/20 blur-[180px] rounded-full animate-float -top-25 -left-25" />
      <div className="absolute w-125 h-125 bg-blue-500/20 blur-[180px] rounded-full animate-float2 -bottom-25 -right-25" />

      <div className="relative z-10 w-full h-full overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-sm">
            Vivek Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/50 font-mono">
              v1.2.0 • System Online
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card title="Total Users" value={total} color="bg-blue-600" icon="👥" />
          <Card title="Pending Review" value={pending} color="bg-yellow-600" icon="⏳" />
          <Card title="Active Accounts" value={approved} color="bg-emerald-600" icon="✅" />
          <Card title="Rejected" value={rejected} color="bg-red-600" icon="🚫" />
        </div>

        {/* Main Content Area */}
        <div className="bg-[#0f1219]/80 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-linear-to-r from-transparent via-white/20 to-transparent"></div>

          {/* Toolbar */}
          <div className="p-4 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">

            {/* Search */}
            <div className="relative w-full md:w-auto min-w-[300px] group">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/30 group-focus-within:text-blue-400 transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or ID..."
                className="w-full bg-[#0a0c10] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/90 placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition shadow-inner"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <FilterBadge label="Profile Status" options={['Active', 'Inactive']} colors={['text-emerald-400', 'text-red-400']} />
              <FilterBadge label="Wallet Status" options={['Pending', 'Active']} colors={['text-blue-400', 'text-emerald-400']} />
              <button className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-95">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#13161c] text-xs uppercase tracking-wider text-white/50 border-b border-white/5 font-medium">
                  <th className="p-4 font-semibold pl-6">User ID</th>
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Contact Info</th>
                  <th className="p-4 font-semibold">Rail Profile</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-white/30">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p>{searchTerm ? "No matching results" : "No applications found"}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                      <td className="p-4 pl-6 text-white/40 font-mono text-xs">#{app.id.toString().slice(-6)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white/70">
                            {app.firstName[0]}{app.lastName[0]}
                          </div>
                          <div>
                            <div className="text-white font-medium text-sm">{app.firstName} {app.lastName}</div>
                            <div className="text-[10px] text-white/40">Registered: {new Date(app.submittedAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-white/80 text-xs font-mono">{app.email}</div>
                        <div className="text-white/40 text-[10px]">{app.mobileNumber}</div>
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/60 font-mono">
                          WFWMSPL03481
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-white/5 bg-white/[0.01] flex justify-between items-center text-xs text-white/40">
            <span>Showing {applications.length} results</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 bg-white/5 border border-white/10 rounded hover:bg-white/10 transition disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>

        {/* Modal */}
        {selectedApp && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedApp(null)}
          >
            <div
              className="relative overflow-hidden bg-[#13161c] border border-white/10 p-6 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">Application Details</h2>
                  <p className="text-xs text-white/40">ID: #{selectedApp.id}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-3">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Personal Information</h3>
                  {Object.entries(selectedApp).map(([key, value]) => (
                    (key === 'firstName' || key === 'lastName' || key === 'email' || key === 'mobileNumber') && (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-white/40 capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="text-white/90 font-medium">{value}</span>
                      </div>
                    )
                  ))}
                </div>

                <div className="p-4 bg-white/[0.03] rounded-xl border border-white/5 space-y-3">
                  <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Technical Details</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Status</span>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Submitted At</span>
                    <span className="text-white/90 font-medium">{new Date(selectedApp.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setSelectedApp(null)} className="px-4 py-2 text-xs font-medium text-white/60 hover:text-white transition">Close</button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-blue-600/20">Edit Record</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ title, value, color, icon }) {
  const colorMap = {
    "bg-blue-600": "text-blue-400 border-blue-500/20 bg-blue-500/5",
    "bg-yellow-600": "text-yellow-400 border-yellow-500/20 bg-yellow-500/5",
    "bg-emerald-600": "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    "bg-red-600": "text-red-400 border-red-500/20 bg-red-500/5",
  };
  const theme = colorMap[color] || "text-white border-white/10 bg-white/5";

  return (
    <div className={`relative p-5 rounded-2xl border ${theme} backdrop-blur-md overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}>
      <div className="relative z-10 flex flex-col">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{title}</span>
        <span className="text-3xl font-extrabold tracking-tight">{value}</span>
      </div>
      <div className="absolute right-[-10px] top-[-10px] text-[80px] opacity-[0.05] rotate-12 group-hover:scale-110 transition-transform duration-500 pointer-events-none grayscale-0">
        {icon}
      </div>
    </div>
  );
}

function FilterBadge({ label, options, colors }) {
  return (
    <div className="flex items-center bg-[#0a0c10] border border-white/10 rounded-xl overflow-hidden h-10 shadow-sm">
      <div className="px-3 h-full flex items-center justify-center bg-white/5 border-r border-white/10 text-[10px] font-bold text-white/50 uppercase tracking-wider">
        {label}
      </div>
      <div className="flex px-3 gap-3">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-1.5 cursor-pointer hover:opacity-100 opacity-70 transition">
            <input type="checkbox" className="w-3 h-3 rounded bg-white/10 border-white/20 checked:bg-blue-500 checked:border-blue-500 accent-blue-500 appearance-none" defaultChecked />
            <span className={`text-[10px] font-medium ${colors[i]}`}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.1)]",
    Approved: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    Rejected: "bg-rose-400/10 text-rose-400 border-rose-400/20 shadow-[0_0_10px_rgba(211,113,133,0.1)]",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wide ${styles[status] || "bg-white/10 text-white"}`}>
      {status === 'Approved' && <span className="mr-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>}
      {status}
    </span>
  );
}