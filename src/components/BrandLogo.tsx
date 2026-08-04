import React from "react";

type BrandLogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  wordmarkClassName?: string;
};

const sizeClasses = {
  sm: {
    icon: "h-9 w-9 rounded-xl",
    iconText: "text-sm",
    text: "text-[1rem]",
    gap: "gap-2.5",
  },

  md: {
    icon: "h-10 w-10 rounded-xl",
    iconText: "text-base",
    text: "text-[1.05rem]",
    gap: "gap-3",
  },

  lg: {
    icon: "h-[3.75rem] w-[3.75rem] rounded-[1.1rem]",
    iconText: "text-xl",
    text: "text-2xl",
    gap: "gap-4",
  },
};

export default function BrandLogo({
  showText = true,
  size = "md",
  className = "",
  wordmarkClassName = "",
}: BrandLogoProps) {
  const classes = sizeClasses[size];

  return (
    <div
      className={`
        flex 
        min-w-0 
        items-center 
        flex-nowrap
        ${classes.gap}
        ${className}
      `}
    >
      {/* Premium D Logo */}
      <div
        className={`
          relative
          flex
          items-center
          justify-center
          shrink-0
          overflow-hidden
          ${classes.icon}
        `}
        style={{
          background:
            "linear-gradient(145deg, #3B82F6 0%, #6366F1 45%, #8B5CF6 100%)",

          boxShadow:
            "0 18px 40px -15px rgba(99,102,241,0.75)",
        }}
       >
        {/* Inner glow */}
        <div
          className="
            absolute
            inset-px
            rounded-[inherit]
            bg-white/10
          "
        />

        {/* Shine effect */}
        <div
          className="
            absolute
            -left-5
            top-0
            h-full
            w-8
            rotate-12
            bg-white/20
            blur-md
          "
        />

        {/* D Letter */}
        <span
          className={`
            relative
            z-10
            font-black
            tracking-tight
            text-white
            drop-shadow-lg
            ${classes.iconText}
          `}
        >
          D
        </span>
      </div>


      {/* Brand Name */}
      {showText && (
        <span
          className={`
            truncate
            font-bold
            tracking-tight
            ${classes.text}
            ${wordmarkClassName}
          `}
          style={{
            color: "var(--foreground)",
          }}
        >
          Dongle
          <span
            style={{
              background:
                "linear-gradient(90deg,#60A5FA,#8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            IQ
          </span>
        </span>
      )}
    </div>
  );
}