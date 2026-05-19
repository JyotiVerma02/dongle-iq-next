"use client";

import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

/**
 * A sticky banner that appears at the top when the browser goes offline.
 * Animates in/out with CSS transitions.
 */
export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div
      data-testid="offline-indicator"
      className={`fixed left-0 right-0 top-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all duration-500 ${
        isOnline
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      }`}
      style={{
        background: "linear-gradient(90deg, #ef4444, #dc2626)",
        boxShadow: "0 4px 20px -4px rgba(239,68,68,0.6)",
      }}
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="h-3.5 w-3.5" />
      <span>No internet connection — working offline</span>
    </div>
  );
}
