"use client";

import { useEffect, useMemo, useState } from "react";

// ✅ Types
type User = {
  _id: string;
  name: string;
  email: string;
  status: "approved" | "rejected" | "pending" | string;
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "approved" | "rejected" | "pending">("all");
  const [toast, setToast] = useState<string | null>(null);

  // 🌙 Dark mode
  const [dark, setDark] = useState(false);

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const pageSize = 5; // you can change to 10/20

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agents");
      const data = await res.json();
      setUsers(data.agents || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  async function updateStatus(id: string, status: string) {
    setLoading(true);
    try {
      await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, status }),
      });
      setToast(`User ${status}`);
      fetchUsers();
    } finally {
      setLoading(false);
      setTimeout(() => setToast(null), 2000);
    }
  }

  // 🔎 Search + Filter
  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => (filter === "all" ? true : u.status === filter))
      .filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      );
  }, [users, search, filter]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // 📊 Export CSV
  const exportCSV = () => {
    const headers = ["Name", "Email", "Status"];
    const rows = filteredUsers.map((u) => [u.name, u.email, u.status]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.map((x) => `\"${x}\"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "users.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div
      className={`min-h-screen flex ${
        dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`w-64 p-6 hidden md:block ${
          dark ? "bg-gray-800" : "bg-white"
        } shadow-lg`}
      >
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-3">
          <li className="font-semibold text-blue-600">Dashboard</li>
          <li>Users</li>
          <li>Settings</li>
        </ul>
      </aside>

      <main className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setDark(!dark)}
            className="px-4 py-2 rounded bg-black text-white"
          >
            {dark ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
            {toast} ✅
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold">Total Users</h2>
            <p className="text-2xl font-bold">{users.length}</p>
          </div>

          <div className="bg-green-100 p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold">Approved</h2>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.status === "approved").length}
            </p>
          </div>

          <div className="bg-red-100 p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold">Rejected</h2>
            <p className="text-2xl font-bold">
              {users.filter((u) => u.status === "rejected").length}
            </p>
          </div>
        </div>

        {/* Search + Filter + Export */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 border rounded w-full md:w-1/2"
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="p-2 border rounded w-full md:w-48"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>

          <button
            onClick={exportCSV}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Export CSV
          </button>
        </div>

        {/* Loader */}
        {loading && (
          <div className="mb-4 text-blue-600 font-semibold">Loading...</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-300">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.status}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => updateStatus(user._id, "approved")}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(user._id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-300 rounded"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}