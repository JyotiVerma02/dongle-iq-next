"use client";
import React, { useEffect, useState } from "react";

export default function CursorGlow() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [smooth, setSmooth] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const animate = () => {
      setSmooth((prev) => ({
        x: prev.x + (mouse.x - prev.x) * 0.08,
        y: prev.y + (mouse.y - prev.y) * 0.08,
      }));

      requestAnimationFrame(animate);
    };

    animate();
  }, [mouse]);

  return (
    <>
      <div
        className="cursor-glow"
        style={{ left: smooth.x, top: smooth.y }}
      />
      <div
        className="cursor-dot"
        style={{ left: mouse.x, top: mouse.y }}
      />
    </>
  );
}