import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

interface StatsCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  isCurrency?: boolean;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple";
}

export function StatsCard({ title, value, trend, icon: Icon, isCurrency, color = "blue" }: StatsCardProps) {
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  
  const premiumGradient = "linear-gradient(135deg, var(--accent), var(--accent-light), var(--accent-secondary))";

  const displayValue = isCurrency ? formatCurrency(value) : value.toLocaleString();
  const isPositive = trend !== undefined && trend >= 0;

  return (
    <div 
      className="ud-surface ud-surface--lift rounded-xl border p-4 sm:p-6"
      style={{
        backgroundColor: colors.card,
        borderColor: colors.borderSoft,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em]" style={{ color: colors.muted }}>{title}</p>
          <h3 className="mt-2 text-3xl font-black uppercase tracking-tight" style={{ color: colors.text }}>
            {displayValue}
          </h3>
          {trend !== undefined && (
            <div className="mt-2 flex items-center text-[11px] font-semibold">
              <span
                className={`flex items-center ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isPositive ? <ArrowUpRight className="mr-1 h-4 w-4" /> : <ArrowDownRight className="mr-1 h-4 w-4" />}
                {Math.abs(trend)}%
              </span>
              <span className="ml-2 uppercase" style={{ color: colors.muted }}>vs last month</span>
            </div>
          )}
        </div>
        <div 
          className="flex h-11 w-11 items-center justify-center rounded-lg text-white shadow-lg"
          style={{ background: premiumGradient }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
