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
    // ... logic remains same
    setTimeout(() => setIsSending(false), 1500); 
  };

  const handleVerify = async () => {
    if (!mobile || mobile.length < 10 || !otp || !isChecked) return;
    router.push(`/bank-telecom-form?type=${activeTab}`);
  };

  return (
    <div className="min-h-screen font-sans antialiased tracking-tight relative overflow-x-hidden flex flex-col items-center">
      <ParticleBackground />

      {/* --- NAVBAR --- */}
      <nav className="w-full z-50 p-5 backdrop-blur-xl border-b border-purple-500/20 bg-black/70 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)]">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl italic uppercase tracking-tighter text-white">
              Dongle<span className="text-purple-400">IQ</span>
            </span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center w-full p-6 py-12 md:py-20">
        <div className="relative group w-full max-w-lg animate-[fadeIn_0.8s_ease-out]">
          {/* Animated Glow Border */}
          <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[32px] opacity-30 blur-sm group-hover:opacity-100 transition-opacity" />
          
          <div className="relative bg-black/40 backdrop-blur-2xl rounded-[30px] border border-purple-500/30 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Identity <span className="text-purple-500">Verification</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black mt-3 opacity-50 text-white">Protocol: Phase 02</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-8">
              {["telecom", "bank"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab} Channel
                </button>
              ))}
            </div>

            <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-5 mb-8">
              <p className="text-xs md:text-sm text-gray-300 text-center leading-relaxed font-medium">
                {activeTab === "telecom" ? (
                  <>Verification via <span className="text-purple-400 font-bold">Official Telecom Records</span>. Ensure the number is linked to your ID.</>
                ) : (
                  <>Establishing secure link via <span className="text-purple-400 font-bold">Bank Identity API</span> for DSC registration.</>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <div className="space-y-2 group/input">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within/input:text-purple-400 transition-colors">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-black/40 border border-white/5 focus:border-purple-500/50 rounded-2xl p-4 pl-12 text-sm font-bold text-white outline-none transition-all"
                  />
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                </div>
              </div>

              <div className="space-y-2 group/input">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within/input:text-purple-400 transition-colors">OTP Code</label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="6-Digit"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 focus:border-purple-500/50 rounded-2xl p-4 pl-12 text-sm font-bold text-white outline-none transition-all"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4 mb-8 group cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
              <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isChecked ? "bg-purple-600 border-purple-600" : "border-white/10 bg-white/5"}`}>
                {isChecked && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] leading-relaxed font-bold text-gray-400 group-hover:text-gray-300 transition-colors">
                  I authorize Dongle IQ to conduct identity verification with {activeTab} providers to finalize DSC credentials.
                </span>
                <span className="text-[8px] text-purple-500 font-black uppercase tracking-widest mt-1">Required Authentication</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-500 disabled:opacity-50"
              >
                {isSending ? "Handshaking..." : "Send OTP Request"}
              </button>

              <button
                onClick={handleVerify}
                disabled={!isChecked}
                className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-2 ${
                  isChecked ? "bg-purple-600 text-white shadow-2xl shadow-purple-500/40 hover:brightness-125" : "bg-white/5 text-gray-600 cursor-not-allowed"
                }`}
              >
                Verify & Continue <span className="text-lg">→</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}