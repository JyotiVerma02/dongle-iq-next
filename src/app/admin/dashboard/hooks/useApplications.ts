import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { User } from "../types";

export function useApplications() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/get-users", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users");
      }
      setUsers(data.users || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message || "Failed to load applications data");
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  const updateStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }
      setUsers((prev) =>
        prev.map((user) => (user._id === data.user._id ? data.user : user))
      );
      toast.success(`User ${status} successfully`);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      toast.error(message);
      return false;
    }
  };

  return { users, setUsers, loading, error, refresh: () => fetchUsers(false), updateStatus };
}
