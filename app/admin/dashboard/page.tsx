/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // FETCH USERS
  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/admin/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: id, status }),
    });

    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* TITLE */}
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* USER LIST */}
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl mb-4">Users</h2>

          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => setSelectedUser(user)}
                className="p-2 border-b cursor-pointer hover:bg-gray-700"
              >
                <p>{user.name}</p>
                <p className="text-sm">{user.email}</p>
              </div>
            ))
          )}
        </div>

        {/* USER DETAILS */}
        <div className="bg-gray-800 p-6 rounded">
          {selectedUser ? (
            <>
              <h2 className="text-2xl mb-4">{selectedUser.name}</h2>

              <p>Email: {selectedUser.email}</p>
              <p>Phone: {selectedUser.number}</p>

              <p className="mt-2">Status: {selectedUser.status || "pending"}</p>

              <div className="mt-4">
                <button
                  onClick={() => updateStatus(selectedUser._id, "approved")}
                  className="bg-green-600 px-3 py-1 mr-2 rounded"
                >
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(selectedUser._id, "rejected")}
                  className="bg-red-600 px-3 py-1 rounded"
                >
                  Reject
                </button>
              </div>
            </>
          ) : (
            <p>Select a user</p>
          )}
        </div>
      </div>
    </div>
  );
}
