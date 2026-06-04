import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminProfile } from "../types";

export function useAuth() {
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAdmin = useCallback(async () => {
    try {
      const response = await fetch("/api/get-admin", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          router.push("/login");
          return;
        }
        if (response.status === 404 && data.message === "Admin not found") {
          toast.error("Admin not found. Please register.");
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Failed to load admin");
      }
      setAdmin(data.admin);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAdmin();
  }, [fetchAdmin]);

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    toast.success("Logged out successfully");
    router.push("/admin/register");
  };

  return { admin, setAdmin, loading, logout };
}
