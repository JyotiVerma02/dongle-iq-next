import Image from "next/image";

type BrandLogoProps = {
  showText?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  wordmarkClassName?: string;
};

const sizeClasses = {
  sm: {
    icon: "h-9 w-9 rounded-xl",
    chip: 16,
    text: "text-[1rem]",
    gap: "gap-2.5",
  },
  md: {
    icon: "h-10 w-10 rounded-xl",
    chip: 18,
    text: "text-[1.05rem]",
    gap: "gap-3",
  },
  lg: {
    icon: "h-[3.75rem] w-[3.75rem] rounded-[1.1rem]",
    chip: 27,
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
    <div className={`flex min-w-0 flex-nowrap items-center ${classes.gap} ${className}`}>
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl ${classes.icon}`}
        style={{
          boxShadow: "0 16px 30px -18px rgba(124, 58, 237, 0.8)",
          backgroundColor: "rgba(255, 255, 255, 0.06)",
        }}
      >
        <Image
          src="/Logo.png"
          alt="DongleIQ logo"
          fill
          className="object-contain"
          sizes="(max-width: 640px) 2.5rem, 3.75rem"
        />
      </div>

      {showText ? (
        <span
          className={`truncate font-semibold tracking-wide ${classes.text} ${wordmarkClassName}`}
          style={{ color: "var(--foreground)" }}
        >
          Dongle<span style={{ color: "var(--accent)" }}>IQ</span>
        </span>
      ) : null}
    </div>
  );
}
