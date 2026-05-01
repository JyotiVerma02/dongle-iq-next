"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

type Props = {
  onClick?: () => void; // optional custom handler
  label?: string;
  className?: string;
};

export default function BackToPreviewButton({
  onClick,
  label = "Back to Preview",
  className = "",
}: Props) {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);

  const handleClick = () => {
    if (onClick) {
      onClick(); // custom behavior (like closing modal)
    } else {
      router.back(); // default behavior
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