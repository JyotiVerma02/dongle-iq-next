"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthGuard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        setCheckingAuth(false);
      } catch {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  return checkingAuth;
}