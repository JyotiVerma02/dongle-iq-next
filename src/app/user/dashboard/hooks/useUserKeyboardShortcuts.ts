import { useEffect, useRef } from "react";
import { UserDashboardView } from "@/components/user-dashboard/UserSidebar";

const USER_SHORTCUT_MAP: Record<string, UserDashboardView> = {
  o: "overview",
  r: "registration",
  p: "payment",
  a: "admin-review",
  c: "certificate-summary",
  d: "documents",
};

/**
 * Activates global keyboard shortcuts for user dashboard navigation.
 * Shortcuts use a "g" prefix chord:
 *   g o → Overview
 *   g r → Registration
 *   g p → Payment
 *   g a → Admin review
 *   g c → Certificate summary
 *   g d → Documents
 *   Ctrl+? → Show shortcuts modal
 */
export function useUserKeyboardShortcuts(
  navigateTo: (view: UserDashboardView) => void,
  onOpenHelp: () => void
) {
  const pendingG = useRef(false);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      // Check for Ctrl+? or ? first
      if ((e.key === "?" && e.ctrlKey) || (e.key === "?" && !e.ctrlKey && !e.altKey && !e.metaKey)) {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // Ignore when modifier keys are held (Ctrl, Alt, Meta) for navigation shortcuts
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      if (pendingG.current) {
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        pendingG.current = false;

        const target = USER_SHORTCUT_MAP[key];
        if (target) {
          e.preventDefault();
          navigateTo(target);
        }
        return;
      }

      if (key === "g") {
        pendingG.current = true;
        pendingTimeout.current = setTimeout(() => {
          pendingG.current = false;
        }, 1000);
        return;
      }

      if (e.key === "Escape") {
        if (pendingG.current) {
          pendingG.current = false;
          if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
    };
  }, [navigateTo, onOpenHelp]);
}
