/* eslint-disable prefer-const */
"use client";

import React, { useEffect, useRef } from "react";

import { useTheme } from "@/app/context/ThemeContext";

class Ripple {
  x: number;
  y: number;
  r: number;
  opacity: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.r = 2;
    this.opacity = 0.8;
  }

  update() {
    this.r += 1.5;
    this.opacity -= 0.02;
  }
}

const SonarClickEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, mounted } = useTheme();

  useEffect(() => {
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ripples: { x: number; y: number; r: number; opacity: number }[] = [];

    const getRippleColor = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--cursor-ripple").trim() ||
      "rgba(109, 40, 217, 0.22)";

    const handleMouseDown = (e: MouseEvent) => {
      ripples.push(new Ripple(e.clientX, e.clientY));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const strokeColor = getRippleColor();

      for (let i = 0; i < ripples.length; i++) {
        ripples[i].update();
        ctx.beginPath();
        ctx.arc(ripples[i].x, ripples[i].y, ripples[i].r, 0, Math.PI * 2);
        ctx.strokeStyle = strokeColor.replace("0.22", `${Math.max(ripples[i].opacity, 0)}`);
        ctx.lineWidth = 1;
        ctx.stroke();
        if (ripples[i].opacity <= 0) {
          ripples.splice(i, 1);
          i--;
        }
      }

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [mounted, theme]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        pointerEvents: "none",
        backgroundColor: "transparent",
      }}
    />
  );
};

export default SonarClickEffect;
