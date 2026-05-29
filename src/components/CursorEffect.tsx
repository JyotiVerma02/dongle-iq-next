"use client";

import React, { useEffect, useRef } from "react";

import { useTheme } from "@/components/ThemeContext";

type Ripple = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
};

export default function CursorEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let ripples: Ripple[] = [];
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, visible: false };

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * pixelRatio);
      canvas.height = Math.floor(window.innerHeight * pixelRatio);
      canvas.style.width = "100vw";
      canvas.style.height = "100vh";
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const pushRipple = (x: number, y: number) => {
      ripples.push({ x, y, radius: 3, opacity: 0.55 });
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY, visible: true };
    };

    const onPointerLeave = () => {
      pointer.visible = false;
    };

    const onPointerDown = (event: PointerEvent) => {
      pushRipple(event.clientX, event.clientY);
    };

    const accentColor = () => {
      const root = getComputedStyle(document.documentElement);
      return root.getPropertyValue("--accent").trim() || "#8b5cf6";
    };

    const accentSecondary = () => {
      const root = getComputedStyle(document.documentElement);
      return root.getPropertyValue("--accent-secondary").trim() || "#06b6d4";
    };

    const animate = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (pointer.visible) {
        const glow = context.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          120
        );
        glow.addColorStop(0, theme === "dark" ? "rgba(139,92,246,0.26)" : "rgba(109,40,217,0.18)");
        glow.addColorStop(0.45, theme === "dark" ? "rgba(6,182,212,0.10)" : "rgba(59,130,246,0.08)");
        glow.addColorStop(1, "rgba(0,0,0,0)");

        context.fillStyle = glow;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 120, 0, Math.PI * 2);
        context.fill();

        context.strokeStyle = theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(109,40,217,0.16)";
        context.lineWidth = 1;
        context.beginPath();
        context.arc(pointer.x, pointer.y, 9, 0, Math.PI * 2);
        context.stroke();
      }

      for (let index = 0; index < ripples.length; index += 1) {
        const ripple = ripples[index];
        ripple.radius += 1.8;
        ripple.opacity -= 0.015;

        context.strokeStyle = `rgba(${theme === "dark" ? "139,92,246" : "109,40,217"}, ${Math.max(ripple.opacity, 0)})`;
        context.lineWidth = 1;
        context.beginPath();
        context.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        context.stroke();

        if (ripple.opacity <= 0) {
          ripples.splice(index, 1);
          index -= 1;
        }
      }

      context.fillStyle = "transparent";
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{ backgroundColor: "transparent" }}
    />
  );
}
