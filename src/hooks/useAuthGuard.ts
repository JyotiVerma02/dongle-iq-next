"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me");

        if (!res.ok) {
          router.replace("/login");
        }
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);
}