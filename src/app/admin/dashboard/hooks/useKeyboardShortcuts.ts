import { useEffect, useRef } from "react";
import { DashboardView } from "../types";

const SHORTCUT_MAP: Record<string, DashboardView> = {
  h: "home",
  a: "applications",
  r: "reports",
  t: "track-dsc",
  s: "admin-settings",
};

/**
 * Activates global keyboard shortcuts for dashboard navigation.
 * Shortcuts use a "g" prefix chord:
 *   g h → Home
 *   g a → Applications
 *   g r → Reports
 *   g t → Track DSC
 *   g s → Admin Settings
 *   ?   → Show shortcuts modal
 *
 * Shortcuts are suppressed when focus is inside an input/textarea/select.
 */
export function useKeyboardShortcuts(
  navigateTo: (view: DashboardView) => void,
  onOpenHelp: () => void
) {
  // Track whether "g" was pressed as the first chord key
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
      // Ignore when modifier keys are held (Ctrl, Alt, Meta)
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const key = e.key.toLowerCase();

      if (pendingG.current) {
        // Clear the pending timeout
        if (pendingTimeout.current) clearTimeout(pendingTimeout.current);
        pendingG.current = false;

        const target = SHORTCUT_MAP[key];
        if (target) {
          e.preventDefault();
          navigateTo(target);
        }
        return;
      }

      if (key === "g") {
        pendingG.current = true;
        // Auto-clear the "g" chord after 1 second if no follow-up key
        pendingTimeout.current = setTimeout(() => {
          pendingG.current = false;
        }, 1000);
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      if (e.key === "Escape") {
        // Escape cancels any pending chord
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
