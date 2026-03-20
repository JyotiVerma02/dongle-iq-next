"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [dark, setDark] = useState(false);
  const [page, setPage] = useState(1);

  const pageSize = 5;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/agents");
    const data = await res.json();
    setUsers(data.agents || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 async function updateStatus(id: string, status: string) {
  console.log("Sending:", id, status);

  const res = await fetch("/api/update-status", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: id, status }),
  });

  const data = await res.json();
  console.log("Response:", data);

  if (data.success) {
    setToast(`User ${status}`);
    fetchUsers();
  } else {
    alert("Error updating status");
  }
}

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => (filter === "all" ? true : u.status === filter))
      .filter((u) =>
        `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
      );
  }, [users, search, filter]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const exportCSV = () => {
    const headers = ["Name", "Email", "Status"];
    const rows = filteredUsers.map((u) => [u.name, u.email, u.status]);

    const csv =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.map((x) => `"${x}"`).join(","))
        .join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "users.csv";
    link.click();
  };

  return (
    <div className={`${dark ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen flex`}>

      {/* Sidebar */}
      <aside className={`${dark ? "bg-gray-800" : "bg-white"} w-64 p-6 shadow-lg hidden md:block`}>
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <ul className="space-y-4">
          <li className="text-blue-500 font-semibold">Dashboard</li>
          <li className="hover:text-blue-400 cursor-pointer">Users</li>
          <li className="hover:text-blue-400 cursor-pointer">Settings</li>
        </ul>
      </aside>

      <main className="flex-1 p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="flex gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="px-4 py-2 rounded bg-black text-white"
            >
              {dark ? "Light Mode" : "Dark Mode"}
            </button>

            <button
              onClick={async () => {
                await fetch("/api/logout");
                window.location.href = "/login";
              }}
              className="px-4 py-2 rounded bg-red-600 text-white"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
            {toast} ✅
          </div>
        )}

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { title: "Total Users", value: users.length },
            { title: "Approved", value: users.filter(u => u.status === "approved").length },
            { title: "Rejected", value: users.filter(u => u.status === "rejected").length },
          ].map((card, i) => (
            <div
              key={i}
              className={`${dark ? "bg-gray-800" : "bg-white"} p-6 rounded-2xl shadow-lg backdrop-blur-md`}
            >
              <h2 className="text-lg">{card.title}</h2>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`p-2 rounded border w-full md:w-1/2 ${
              dark ? "bg-gray-800 border-gray-600 text-white" : ""
            }`}
          />

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className={`p-2 rounded border ${
              dark ? "bg-gray-800 border-gray-600 text-white" : ""
            }`}
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
        {loading && <p className="text-blue-500">Loading...</p>}

        {/* Table */}
        <div className={`${dark ? "bg-gray-800" : "bg-white"} rounded-2xl shadow overflow-hidden`}>
          <table className="w-full">
            <thead className={`${dark ? "bg-gray-700" : "bg-gray-200"}`}>
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user._id}
                  className={`border-t ${dark ? "hover:bg-gray-700" : "hover:bg-gray-50"}`}
                >
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.status === "approved"
                          ? "bg-green-500 text-white"
                          : user.status === "rejected"
                          ? "bg-red-500 text-white"
                          : "bg-yellow-500 text-white"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => updateStatus(user._id, "approved")}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:scale-105 transition"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => updateStatus(user._id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:scale-105 transition"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6 gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-400 rounded"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages || 1}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-gray-400 rounded"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
}