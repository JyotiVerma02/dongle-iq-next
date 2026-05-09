export const getThemeConfig = (isDarkMode: boolean) => ({
  bg: isDarkMode ? "bg-[#07121a]" : "bg-[#f6fbfa]",
  card: isDarkMode ? "bg-[#0d1d28]" : "bg-white",
  inputBg: isDarkMode ? "bg-emerald-100/5" : "bg-emerald-50",
  border: isDarkMode ? "border-[#183243]" : "border-[#c7dfda]",
  text: isDarkMode ? "text-[#e8fbff]" : "text-[#102132]",
  textMuted: isDarkMode ? "text-cyan-100/60" : "text-slate-500",
  accent: isDarkMode ? "bg-[#34d399]" : "bg-[#0f766e]",
  nav: isDarkMode ? "bg-[#07121a]/80" : "bg-white/80",
  // Standard SaaS Font Styles
  heading: "font-black uppercase tracking-tighter italic",
  label: "font-black text-[10px] uppercase tracking-widest",
});
