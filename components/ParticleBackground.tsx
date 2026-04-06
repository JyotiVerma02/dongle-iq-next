"use client";

import { useEffect, useRef } from "react";

class Particle {
  x: number; y: number; vx: number; vy: number; size: number;
  canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = (Math.random() - 0.5) * 0.4;
    this.size = Math.random() * 1.5 + 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
    if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
    this.ctx.fill();
  }
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle(canvas, ctx));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.update();
        p.draw();

        for (let j = index + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    window.addEventListener("resize", init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", init);
    };
  }, []);

return (
  <canvas
    ref={canvasRef}
    // Added 'fixed inset-0' to ensure it covers the viewport 
    // and '-z-10' to put it behind the page content
    className="fixed inset-0 w-full h-full -z-10 pointer-events-none bg-[#0a0a0c]"
  />
);
}