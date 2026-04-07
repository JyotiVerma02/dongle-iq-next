/* eslint-disable react-hooks/unsupported-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, ShieldCheck, Smartphone, Lock, CheckCircle2 } from "lucide-react";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!mounted) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let particles: any[] = [];
    let animationFrameId: number;

    class Particle {
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
      }
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(168, 85, 247, 0.4)";
        ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) particles.push(new Particle());
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
  }, [mounted]);

  if (!mounted) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#0a0a0c]"
    />
  );
};

export default function VerifyPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState("telecom");
  const [isChecked, setIsChecked] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const router = useRouter();

  const handleSendOtp = async () => {
  if (mobile.length !== 10) return alert("Enter 10 digit number");

  setIsSending(true);

  try {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mobile }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Failed to send OTP");
    } else {
      alert("OTP sent successfully");
    }

  } catch (err) {
    alert("Error sending OTP");
  }

  setIsSending(false);
};
  const handleVerify = async () => {
    if (!mobile || mobile.length < 10 || !otp || !isChecked) return;
    router.push(`/bank-telecom-form?type=${activeTab}`);
  };

  return (
    <main className="flex-1 flex items-center justify-center w-full p-4">
  <div className="relative group w-full max-w-sm animate-[fadeIn_0.8s_ease-out] mt-30">
    
    {/* Glow Border */}
    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-xl opacity-30 blur-sm group-hover:opacity-100 transition-opacity" />
    
    {/* CARD */}
    <div className="relative bg-black/40 backdrop-blur-2xl rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      
      {/* Heading */}
      <div className="text-center mb-4">
        <h1 className="text-xl font-black uppercase tracking-tighter text-white">
          Identity <span className="text-purple-500">Verification</span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-lg mb-4">
        {["telecom", "bank"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest ${
              activeTab === tab
                ? "bg-purple-600 text-white"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-purple-600/10 rounded-md p-2 mb-4 text-[10px] text-gray-300 text-center">
        {activeTab === "telecom"
          ? "Verify via telecom records"
          : "Verify via bank identity API"}
      </div>

      {/* Inputs */}
      <div className="space-y-3 mb-4">
        
        <input
          type="tel"
          maxLength={10}
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          className="w-full p-2.5 text-xs rounded-lg bg-black/40 border border-white/10 outline-none text-white"
        />

        <input
          type="text"
          maxLength={6}
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2.5 text-xs rounded-lg bg-black/40 border border-white/10 outline-none text-white"
        />
      </div>

      {/* Checkbox */}
      <div
        className="flex items-center gap-2 mb-4 cursor-pointer"
        onClick={() => setIsChecked(!isChecked)}
      >
        <div className={`w-4 h-4 rounded border ${isChecked ? "bg-purple-600" : "border-white/20"}`} />
        <span className="text-[10px] text-gray-400">
          I agree to verification
        </span>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        
        <button
          onClick={handleSendOtp}
          disabled={isSending}
          className="w-full py-2 text-[10px] border border-purple-500 text-purple-400 rounded-lg"
        >
          {isSending ? "Sending..." : "Send OTP"}
        </button>

        <button
          onClick={handleVerify}
          disabled={!isChecked}
          className={`w-full py-2 text-[11px] font-black rounded-lg ${
            isChecked
              ? "bg-purple-600 text-white"
              : "bg-gray-800 text-gray-500"
          }`}
        >
          Verify
        </button>
      </div>
    </div>
  </div>
</main>
  );
}