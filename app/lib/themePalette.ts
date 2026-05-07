export type ThemePalette = {
  shell: string;
  shellAlt: string;
  card: string;
  panel: string;
  panelStrong: string;
  accent: string;
  accentLight: string;
  accentSoft: string;
  accentSubtle: string;
  accentFaint: string;
  accentStrong: string;
  accentShadow: string;
  text: string;
  muted: string;
  subtleText: string;
  border: string;
  borderSoft: string;
  input: string;
  inputBorder: string;
  overlay: string;
  glow: string;
};

export function getThemePalette(isDarkMode: boolean): ThemePalette {
  return {
    shell: "var(--background)",
    shellAlt: "var(--background-alt)",
    card: "var(--card)",
    panel: "var(--card)",
    panelStrong: "var(--card-strong)",
    accent: "var(--accent)",
    accentLight: "var(--accent-light)",
    accentSoft: "var(--accent-soft)",
    accentSubtle: "var(--accent-subtle)",
    accentFaint: "var(--accent-faint)",
    accentStrong: "var(--accent-strong)",
    accentShadow: "var(--accent-shadow)",
    text: "var(--foreground)",
    muted: "var(--muted)",
    subtleText: "var(--subtle-text)",
    border: "var(--border)",
    borderSoft: "var(--border-soft)",
    input: "var(--input)",
    inputBorder: "var(--input-border)",
    overlay: "var(--overlay)",
    glow: "var(--accent-glow)",


    
  };
}
