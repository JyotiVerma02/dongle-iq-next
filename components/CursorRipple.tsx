"use client";

import { useEffect, useState } from "react";

export default function CursorRipple() {
  const [ripples, setRipples] = useState<any[]>([]);

  useEffect(() => {
    const handleMouseEnter = (e: MouseEvent) => {
      const ripple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };

      setRipples((prev) => [...prev, ripple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter(r => r.id !== ripple.id));
      }, 700);
    };

    // 👇 ONLY trigger on navbar items / buttons
    const targets = document.querySelectorAll("button, a");

    targets.forEach(el => {
      el.addEventListener("mouseenter", handleMouseEnter);
    });

    return () => {
      targets.forEach(el => {
        el.removeEventListener("mouseenter", handleMouseEnter);
      });
    };
  }, []);

  return (
    <>
      {ripples.map((r) => (
        <span
          key={r.id}
          className="cursor-ripple"
          style={{
            left: r.x - 20,
            top: r.y - 20,
          }}
        />
      ))}
    </>
  );
}