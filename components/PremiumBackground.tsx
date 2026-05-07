"use client";

import { useEffect, useMemo } from "react";

type ParticleSpec = {
  left: number;
  top: number;
  size: number;
  delay: number;
  dur: number;
  dx: number;
  dy: number;
  tint: number;
};

const createSeededRandom = (seed: number) => {
  let value = seed;

  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296;
    return value / 4294967296;
  };
};

const buildParticles = (count: number): ParticleSpec[] => {
  const random = createSeededRandom(20260507);

  return Array.from({ length: count }).map((_, i) => {
    const left = random() * 100;
    const top = random() * 100;
    const size = 1.1 + random() * 1.8;
    const delay = random() * 20;
    const dur = 16 + random() * 18;
    const dx = (random() - 0.5) * 54;
    const dy = (random() - 0.5) * 42;

    return { left, top, size, delay, dur, dx, dy, tint: i % 3 };
  });
};

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

  const particles = useMemo(() => buildParticles(140), []);

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
               "--dx": `${p.dx}px`,
                "--dy": `${p.dy}px`,
                "--tint": p.tint,
              } as React.CSSProperties
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
