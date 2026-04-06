/* eslint-disable prefer-const */
"use client";

import React, { useRef, useEffect } from 'react';

const SonarClickEffect = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ripples: any[] = [];

    class Ripple {
      x: number; y: number; r: number; opacity: number;
      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.r = 2; // Starting radius
        this.opacity = 0.8;
      }
      update() {
        this.r += 1.5; // Expansion speed
        this.opacity -= 0.02; // Fade speed
      }
      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(168, 85, 247, ${this.opacity})`;
        ctx.lineWidth = 1; // Ultra thin line
        ctx.stroke();
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      ripples.push(new Ripple(e.clientX, e.clientY));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < ripples.length; i++) {
        ripples[i].update();
        ripples[i].draw();
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

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('resize', handleResize);
    handleResize();
    animate();

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'transparent'
      }}
    />
  );
};

export default SonarClickEffect;