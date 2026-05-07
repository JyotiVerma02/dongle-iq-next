"use client";

import { useEffect, useMemo } from "react";

export default function PremiumBackground() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !finePointer) {
      return;
    }

    const root = document.documentElement;
    let raf = 0;
    let nextX = window.innerWidth * 0.6;
    let nextY = window.innerHeight * 0.35;

    const commit = () => {
      raf = 0;
      root.style.setProperty("--spot-x", `${Math.round(nextX)}px`);
      root.style.setProperty("--spot-y", `${Math.round(nextY)}px`);
    };

    const onMove = (event: PointerEvent) => {
      nextX = event.clientX;
      nextY = event.clientY;
      if (!raf) raf = window.requestAnimationFrame(commit);
    };

    root.style.setProperty("--spot-x", `${Math.round(nextX)}px`);
    root.style.setProperty("--spot-y", `${Math.round(nextY)}px`);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const particles = useMemo(() => {
    const count = 90;
    const items = Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const size = 1 + Math.random() * 1.2; // tiny dots
      const delay = Math.random() * 20; // slow staggering
      const dur = 18 + Math.random() * 22; // slow motion
      const dx = (Math.random() - 0.5) * 36; // subtle drift
      const dy = (Math.random() - 0.5) * 26;

      // Slightly vary color intensity using a seed-like modulus
      const tint = i % 3;
      return { left, top, size, delay, dur, dx, dy, tint };
    });
    return items;
  }, []);

  return (
    <div className="saas-bg" aria-hidden="true">
      <div className="saas-bg__base" />
      <div className="saas-bg__aurora" />
      <div className="saas-bg__blobs">
        <div className="saas-bg__blob saas-bg__blob--a" />
        <div className="saas-bg__blob saas-bg__blob--b" />
        <div className="saas-bg__blob saas-bg__blob--c" />
      </div>
      <div className="saas-bg__particles">
        {particles.map((p, idx) => (
          <span
            key={`p-${idx}`}
            className="saas-bg__particle"
            style={
              {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.dur}s`,
                ["--dx" as any]: `${p.dx}px`,
                ["--dy" as any]: `${p.dy}px`,
                ["--tint" as any]: p.tint,
              } as any
            }
          />
        ))}
      </div>
      <div className="saas-bg__grid" />
      <div className="saas-bg__spotlight" />
      <div className="saas-bg__grain" />
    </div>
  );
}

