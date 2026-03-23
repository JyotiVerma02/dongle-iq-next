
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    // eslint-disable-next-line react-hooks/unsupported-syntax
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
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
        ctx!.fillStyle = "rgba(100, 150, 255, 0.4)";
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
            ctx.strokeStyle = `rgba(150, 180, 255, ${0.15 * (1 - dist / 120)})`;
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
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-linear-to-br from-[#f8fbff] to-[#f0f4f9]"
    />
  );
};

export default function VerifyPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [activeTab, setActiveTab] = useState("telecom");
  const [isChecked, setIsChecked] = useState(false);

  const router = useRouter();

  const handleVerify = () => {
    if (!isChecked) {
      alert("⚠️ Please accept terms & conditions");
      return;
    }
    if (!mobile || !otp) {
      alert("⚠️ Enter mobile & OTP");
      return;
    }
    alert("✅ Verified Successfully");
    router.push("/bank-telecom-form");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />

      {/* Optimized Width: Clamped between 320px and 440px for perfect responsiveness */}
      <div className="relative z-10 w-full max-w-110 bg-white/75 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 border border-white/60 transition-all duration-500">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight uppercase">
            Identity{" "}
            <span className="text-blue-600 font-black">Verification</span>
          </h1>
          <div className="h-0.75 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Tabs - Centered and Larger Font */}
        <div className="flex gap-2 mb-1 bg-slate-200/40 p-1.5 rounded-md border border-slate-200/50">
          {["telecom", "bank"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-[12px] md:text-[13px] font-black uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab
                  ? "bg-white text-blue-600 shadow-md border border-slate-100"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic Instruction - Higher Contrast */}
        <div className="bg-blue-600/5 rounded- p-4 border border-blue-100/50">
          <p className="text-[13px] md:text-[14px] text-slate-700 text-center font-medium leading-relaxed">
            {activeTab === "telecom" ? (
              <>
                Enter applicant&apos;s 10-digit mobile number. <br />
                <span className="text-blue-600 font-bold">
                  Must match official telecom records.
                </span>
              </>
            ) : (
              <>
                Secure mobile verification for{" "}
                <span className="text-blue-600 font-bold">
                 DSC registration
                </span>{" "}
                via Bank.
              </>
            )}
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex gap-2 my-4">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
              Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="Ex: 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border-2 border-slate-100 bg-white/60 rounded-md px-2 py-1.5 text-base text-slate-800 font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/5"
            />
          </div>

          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
              OTP Code
            </label>
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border-2 border-slate-100 bg-white/60 rounded-md px-2 py-1.5 text-base text-slate-800 font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-xl focus:shadow-blue-500/5"
            />
          </div>
        </div>

        {/* Consent Section - Better Spacing */}
        <div className="flex items-start gap-4 mb-2 px-1">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="w-5 h-5 rounded-lg border-2 border-slate-300 text-blue-600 accent-blue-600 cursor-pointer transition-transform active:scale-90"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] md:text-[13px] leading-snug font-bold text-slate-600">
              {activeTab === "telecom"
                ? "I authorize mobile identity verification with telecom providers."
                : "I authorize secure name verification with Bank records."}
            </span>
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1">
              Required Field
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3.5">
          <button className="w-full py-3 rounded- font-black text-[12px] uppercase tracking-[0.2em] transition-all bg-white border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white active:scale-95 shadow-sm">
            Send OTP
          </button>

          <button
            onClick={handleVerify}
            disabled={!isChecked}
            className={`w-full py-4 rounded- font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 ${
              isChecked
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
            }`}
          >
            Verify & Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
