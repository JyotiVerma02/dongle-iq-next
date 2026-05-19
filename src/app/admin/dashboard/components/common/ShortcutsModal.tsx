"use client";

import { useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

export interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutItem[];
}

const DEFAULT_SHORTCUTS: ShortcutItem[] = [
  { keys: ["g", "h"], description: "Go to Dashboard" },
  { keys: ["g", "a"], description: "Go to All Applications" },
  { keys: ["g", "r"], description: "Go to Reports" },
  { keys: ["g", "t"], description: "Go to Track DSC" },
  { keys: ["g", "s"], description: "Go to Admin Settings" },
  { keys: ["Ctrl", "?"], description: "Show keyboard shortcuts" },
  { keys: ["Esc"], description: "Close this panel / cancel chord" },
];

/**
 * Modal overlay displaying all available keyboard shortcuts.
 * Dismissed on Escape or clicking outside.
 */
export function ShortcutsModal({ isOpen, onClose, shortcuts }: ShortcutsModalProps) {
  const list = shortcuts || DEFAULT_SHORTCUTS;
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
      data-testid="shortcuts-modal"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl border p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
        style={{ backgroundColor: colors.card, borderColor: colors.borderSoft }}
      >
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-4 w-4" style={{ color: colors.accent }} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: colors.text }}>
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: colors.muted }}
            aria-label="Close shortcuts modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Shortcut list */}
        <ul className="space-y-2">
          {list.map(({ keys, description }) => (
            <li
              key={keys.join("+")}
              className="flex items-center justify-between gap-3"
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: colors.muted }}
              >
                {description}
              </span>
              <div className="flex flex-shrink-0 items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold shadow-sm"
                    style={{
                      backgroundColor: colors.panel,
                      borderColor: colors.borderSoft,
                      color: colors.text,
                    }}
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: colors.subtleText }}>
          Press <kbd className="rounded border px-1 font-mono text-[9px]" style={{ borderColor: colors.borderSoft }}>g</kbd> then a letter key to navigate
        </p>
      </div>
    </div>
  );
}
