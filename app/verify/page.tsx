/* eslint-disable react-hooks/unsupported-syntax */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (data.success) alert("✅ OTP Sent!");
      else alert(`❌ ${data.message}`);
    } catch (err) {
      alert("❌ Error");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerify = async () => {
    if (!mobile || mobile.length < 10) {
      alert("⚠️ Enter a valid 10-digit mobile number");
      return;
    }
    if (!otp) {
      alert("⚠️ Enter the OTP code");
      return;
    }
    if (!isChecked) {
      alert("⚠️ Please accept terms & conditions");
      return;
    }

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp, type: activeTab }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ ${activeTab.toUpperCase()} Verified Successfully`);
        router.push(`/bank-telecom-form?type=${activeTab}`);
      } else {
        alert("❌ Verification Failed: Incorrect OTP");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden selection:bg-purple-500/30 selection:text-purple-200">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-110 bg-black/40 backdrop-blur-2xl rounded-3xl shadow-[0_0_40px_rgba(168,85,247,0.2)] p-6 border-2 border-purple-500/40 transition-all duration-500">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-light text-white tracking-tight uppercase">
            Identity <span className="text-purple-500 font-black">Verification</span>
          </h1>
          <div className="h-0.75 w-12 bg-purple-500 mx-auto mt-2 rounded-full"></div>
        </div>

        <div className="flex gap-2 mb-1 bg-white/5 p-1.5 rounded-md border border-white/10">
          {["telecom", "bank"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[12px] md:text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab ? "bg-purple-600 text-white shadow-md border border-purple-400/30" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-purple-500/5 rounded p-4 border border-purple-500/20">
          <p className="text-[13px] md:text-[14px] text-slate-300 text-center font-medium leading-relaxed">
            {activeTab === "telecom" ? (
              <>Enter applicant&apos;s 10-digit mobile number. <br /> <span className="text-purple-500 font-bold">Must match official telecom records.</span></>
            ) : (
              <>Secure mobile verification for <span className="text-purple-500 font-bold">DSC registration</span> via Bank.</>
            )}
          </p>
        </div>

        <div className="flex gap-2 my-4">
          <div className="group flex-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">Mobile Number</label>
            <input
              type="tel"
              maxLength={10}
              placeholder="Ex: 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              className="w-full border-2 border-white/10 bg-white/5 rounded-md px-2 py-1.5 text-base text-white font-bold outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
            />
          </div>

          <div className="group flex-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2 ml-1">OTP Code</label>
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border-2 border-white/10 bg-white/5 rounded-md px-2 py-1.5 text-base text-white font-bold outline-none transition-all focus:border-purple-500/50 focus:bg-white/10"
            />
          </div>
        </div>

        <div className="flex items-start gap-4 mb-2 px-1">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="w-5 h-5 rounded-lg border-2 border-white/20 text-purple-600 accent-purple-600 cursor-pointer transition-transform active:scale-90"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] md:text-[13px] leading-snug font-bold text-slate-400">
              {activeTab === "telecom" ? "I authorize mobile identity verification with telecom providers." : "I authorize secure name verification with Bank records."}
            </span>
            <span className="text-[9px] text-purple-500 font-black uppercase tracking-widest mt-1">Required Field</span>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <button
            onClick={handleSendOtp}
            disabled={isSending}
            className="w-full py-3 font-black text-[12px] uppercase tracking-[0.2em] bg-transparent border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send OTP"}
          </button>

          <button
            onClick={handleVerify}
            className={`w-full py-4 rounded- font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 ${
              isChecked ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-500/30" : "bg-white/5 text-slate-600 cursor-not-allowed shadow-none"
            }`}
          >
            Verify & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}