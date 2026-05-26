"use client";

import Image from "next/image";

/** 3D shield graphic for the overview hero banner (matches design asset) */
export function OverviewHeroShield({ className = "" }: { className?: string }) {
  return (
    <div
      className={`ud-hero-shield-art relative flex items-center justify-center ${className}`}
      aria-hidden
    >
      <Image
        src="/28c66551-1043-4c66-994c-edef655684b6.png"
        alt=""
        width={256}
        height={160}
        priority
        unoptimized
        className="relative z-[1] h-[150px] w-auto max-w-none object-contain xl:h-[175px]"
      />
    </div>
  );
}
