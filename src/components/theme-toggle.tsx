'use client';

import * as React from 'react';
import { Moon, SunMedium } from 'lucide-react';
import { useTheme } from '@/components/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, mounted, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      // These classes create a 44px by 44px square button.
      // Crucially, there are no 'px-*' or 'py-*' padding classes.
      className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border shadow-[0_16px_28px_-24px_var(--accent-shadow)] transition-colors"
      aria-label="Toggle theme"
      title="Toggle theme"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border-soft)',
      }}
    >
      {!mounted ? null : isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}