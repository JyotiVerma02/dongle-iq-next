export const getThemeConfig = (isDarkMode: boolean) => ({
  bg: isDarkMode ? "bg-[#080b12]" : "bg-slate-50",
  card: isDarkMode ? "bg-[#121620]" : "bg-white",
  inputBg: isDarkMode ? "bg-black/40" : "bg-slate-100",
  border: isDarkMode ? "border-[#1e2330]" : "border-slate-200",
  text: isDarkMode ? "text-white" : "text-slate-900",
  textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
  accent: "bg-purple-600",
  nav: isDarkMode ? "bg-[#080b12]/80" : "bg-white/80",
  // Standard SaaS Font Styles
  heading: "font-black uppercase tracking-tighter italic",
  label: "font-black text-[10px] uppercase tracking-widest",
});