import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useTheme } from "@/components/ThemeContext";

interface StatsCardProps {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  isCurrency?: boolean;
  color?: "blue" | "emerald" | "amber" | "rose" | "purple";
}

const ICON_GRADIENTS: Record<string, { bg: string; shadow: string }> = {
  purple: { bg: "linear-gradient(135deg, #a855f7, #7c3aed)", shadow: "rgba(124,58,237,0.35)" },
  amber:  { bg: "linear-gradient(135deg, #f97316, #ea580c)", shadow: "rgba(234,88,12,0.35)" },
  emerald:{ bg: "linear-gradient(135deg, #22c55e, #16a34a)", shadow: "rgba(22,165,74,0.35)" },
  rose:   { bg: "linear-gradient(135deg, #f43f5e, #e11d48)", shadow: "rgba(225,29,72,0.35)" },
  blue:   { bg: "linear-gradient(135deg, #3b82f6, #2563eb)", shadow: "rgba(37,99,235,0.35)" },
};

export function StatsCard({ title, value, trend, icon: Icon, isCurrency, color = "blue" }: StatsCardProps) {
  const { isDarkMode } = useTheme();

  const displayValue = isCurrency ? formatCurrency(value) : value.toLocaleString();
  const isPositive = trend !== undefined && trend >= 0;
  const gradient = ICON_GRADIENTS[color] || ICON_GRADIENTS.blue;

  return (
    <div
      className="ud-surface ud-surface--lift rounded-xl border p-4 transition-all"
      style={{
        backgroundColor: isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff",
        borderColor: isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-start gap-3">
        {/* Colored icon */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{
            background: gradient.bg,
            boxShadow: `0 6px 16px -4px ${gradient.shadow}`,
          }}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p
            className="truncate whitespace-nowrap text-[8px] font-bold uppercase leading-tight tracking-[0.1em] sm:text-[9px]"
            style={{ color: isDarkMode ? "rgba(255,255,255,0.4)" : "#94a3b8" }}
          >
            {title}
          </p>
          <h3
            className="mt-1 text-[1.15rem] font-black leading-none tracking-tight sm:text-[1.3rem]"
            style={{ color: isDarkMode ? "#f8fafc" : "#0f172a" }}
          >
            {displayValue}
          </h3>
          {trend !== undefined && (
            <div className="mt-1.5 flex items-center text-[9px] font-bold">
              <span className={`flex items-center ${isPositive ? "text-emerald-500" : "text-rose-500"}`}>
                {isPositive ? (
                  <ArrowUpRight className="mr-0.5 h-3 w-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3 w-3 stroke-[2.5]" />
                )}
                {Math.abs(trend)}%
              </span>
              <span
                className="ml-1 font-medium"
                style={{ color: isDarkMode ? "rgba(255,255,255,0.3)" : "#94a3b8" }}
              >
                from last month
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
