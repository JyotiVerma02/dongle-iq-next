export type ThemePalette = {
  shell: string;
  shellAlt: string;
  card: string;
  panel: string;
  panelStrong: string;
  accent: string;
  accentLight: string;
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
  if (isDarkMode) {
    return {
      shell: "#0a0a0c",
      shellAlt: "#111218",
      card: "rgba(16, 18, 26, 0.72)",
      panel: "rgba(18, 22, 32, 0.78)",
      panelStrong: "#10161d",
      accent: "#7c3aed",
      accentLight: "#c4b5fd",
      text: "#f8fafc",
      muted: "#9ca3af",
      subtleText: "#64748b",
      border: "rgba(124, 58, 237, 0.24)",
      borderSoft: "rgba(255, 255, 255, 0.08)",
      input: "rgba(255, 255, 255, 0.06)",
      inputBorder: "rgba(255, 255, 255, 0.08)",
      overlay: "rgba(5, 5, 10, 0.72)",
      glow: "rgba(124, 58, 237, 0.34)",
    };
  }

  return {
    shell: "#eef3fb",
    shellAlt: "#f8fbff",
    card: "rgba(255, 255, 255, 0.78)",
    panel: "rgba(255, 255, 255, 0.86)",
    panelStrong: "#ffffff",
    accent: "#6d28d9",
    accentLight: "#7c3aed",
    text: "#142132",
    muted: "#526277",
    subtleText: "#7b8ba1",
    border: "rgba(109, 40, 217, 0.16)",
    borderSoft: "rgba(20, 33, 50, 0.10)",
    input: "rgba(255, 255, 255, 0.92)",
    inputBorder: "rgba(20, 33, 50, 0.10)",
    overlay: "rgba(255, 255, 255, 0.74)",
    glow: "rgba(109, 40, 217, 0.18)",
  };
}
