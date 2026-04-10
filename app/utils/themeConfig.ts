export const getThemeConfig = (isDarkMode: boolean) => ({
  bg: isDarkMode ? "bg-[#020617]" : "bg-[#F1F5F9]",
  card: isDarkMode ? "bg-[#0F172A]" : "bg-white",
  inputBg: isDarkMode ? "bg-white/5" : "bg-slate-100",
  border: isDarkMode ? "border-[#1E293B]" : "border-[#CBD5F5]",
  text: isDarkMode ? "text-[#E2E8F0]" : "text-[#0F172A]",
  textMuted: isDarkMode ? "text-slate-400" : "text-slate-500",
  accent: isDarkMode ? "bg-[#3B82F6]" : "bg-[#1D4ED8]",
  nav: isDarkMode ? "bg-[#020617]/80" : "bg-white/80",
  // Standard SaaS Font Styles
  heading: "font-black uppercase tracking-tighter italic",
  label: "font-black text-[10px] uppercase tracking-widest",
});