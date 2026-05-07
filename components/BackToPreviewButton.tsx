"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type Props = {
  onClick?: () => void;
  label?: string;
  className?: string;
  fallbackRoute?: string;
};

export default function BackToPreviewButton({
  onClick,
  label = "Back to Preview",
  className = "",
  fallbackRoute,
}: Props) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const handleClick = () => {
    if (onClick) return onClick();

    if (fallbackRoute) {
      router.push(fallbackRoute);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 rounded-md  px-2 py-1 text-[11px] text-bold tracking-[0.14em] transition hover:-translate-y-0.5 ${className}`}
      style={{
        color: colors.text,
      }}
    >
      <ArrowLeft size={14} />
      {label}
    </button>
  );
}
