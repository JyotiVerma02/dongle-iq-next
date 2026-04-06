/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cpu, ShieldCheck, Smartphone, Lock, CheckCircle2 } from "lucide-react";

// --- PARTICLE BACKGROUND COMPONENT ---
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
        p.update(); p.draw();
        for (let j = index + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y); ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init(); animate();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", init); };
  }, [mounted]);

  if (!mounted) return null;
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#0a0a0c]" />;
};

// --- OTP BOX COMPONENT ---
const OtpInput = ({ value, onChange, onKeyDown, index, inputRef }: any) => (
  <input
    ref={inputRef}
    type="text"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    className="w-10 h-12 md:w-12 md:h-14 text-center text-xl font-black bg-black/40 border border-white/10 rounded-2xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none text-white transition-all shadow-2xl"
  />
);

export default function AadhaarVerifyPage() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isChecked, setIsChecked] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => { if (otpSent) inputRefs.current[0]?.focus(); }, [otpSent]);

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(mobile)) return setError("Enter valid 10-digit number");
    setError(""); setIsSendingOtp(true);
    try {
      const res = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, action: "send-otp" }),
      });
      const data = await res.json();
      if (data.success) { setOtpSent(true); setTimer(120); setSuccess("OTP sent successfully!"); }
      else setError(data.message || "Failed to send OTP");
    } catch (err) { setError("Connection error"); } finally { setIsSendingOtp(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    if (!isChecked || otp.join("").length !== 6) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp: otp.join(""), action: "verify" }),
      });
      const data = await res.json();
      if (data.success) { setSuccess("✅ Verified!"); setTimeout(() => router.push("/bank-telecom-form"), 1000); }
      else { setError(data.message || "Failed"); setOtp(["", "", "", "", "", ""]); inputRefs.current[0]?.focus(); }
    } catch (err) { setError("Server error"); } finally { setIsVerifying(false); }
  };

  return (
    <div className="min-h-screen font-sans antialiased tracking-tight relative overflow-x-hidden flex flex-col items-center">
      <ParticleBackground />

      {/* --- NAVBAR --- */}
      <nav className="w-full z-50 p-5 backdrop-blur-xl border-b border-purple-500/20 bg-black/70 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-transform group-hover:rotate-12">
              <Cpu size={20} className="text-white" />
            </div>
            <span className="font-black text-xl italic uppercase tracking-tighter text-white">
              Dongle<span className="text-purple-400">IQ</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <ShieldCheck size={14} className="text-purple-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Secure Node</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center w-full p-6 py-12 md:py-20">
        {/* Container matches the width and padding of your Verify Page */}
        <div className="relative group w-full max-w-lg animate-[fadeIn_0.8s_ease-out]">
          
          {/* Animated Glow Border */}
          <div className="absolute -inset-[1.5px] bg-gradient-to-r from-purple-600 via-transparent to-purple-600 rounded-[32px] opacity-30 blur-sm group-hover:opacity-100 transition-opacity" />
          
          <div className="relative bg-black/40 backdrop-blur-3xl rounded-[30px] border border-purple-500/30 p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                Aadhaar <span className="text-purple-500">Verification</span>
              </h1>
              <div className="h-0.5 w-10 bg-purple-500 mx-auto mt-3 rounded-full shadow-[0_0_10px_#a855f7]"></div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black mt-3 opacity-50 text-white">Identity Handshake: Active</p>
            </div>

            {/* Error/Success Notifications */}
            <div className="min-h-[24px] mb-4 text-center">
              {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest animate-pulse">{error}</p>}
              {success && <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest">{success}</p>}
            </div>

            <div className="bg-purple-600/10 border border-purple-500/20 rounded-2xl p-5 mb-8">
              <p className="text-xs md:text-sm text-gray-300 text-center leading-relaxed font-medium">
                Required for Digital Signature Certificate (DSC). <br />
                <span className="text-purple-500 font-black uppercase text-[10px] tracking-widest">Enter Linked Mobile Number</span>
              </p>
            </div>

            <div className="space-y-6">
              {/* Mobile Input Field */}
              <div className="space-y-2 group/input">
                <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 group-focus-within/input:text-purple-400 transition-colors">Mobile Number</label>
                <div className="relative">
                  <input
                    type="tel" maxLength={10} value={mobile} disabled={otpSent}
                    placeholder="9876543210"
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-black/40 border border-white/5 focus:border-purple-500/50 rounded-2xl p-4 pl-12 text-sm font-bold text-white outline-none transition-all disabled:opacity-50"
                  />
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
                </div>
              </div>

              {/* OTP Logic - 6 Box layout like original logic */}
              {otpSent ? (
                <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
                  <label className="block text-[9px] font-black text-gray-500 uppercase tracking-widest text-center">Enter 6-Digit Auth Code</label>
                  <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                      <OtpInput key={index} index={index} value={digit} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} inputRef={(el: any) => (inputRefs.current[index] = el)} />
                    ))}
                  </div>
                  <div className="text-center">
                    <button onClick={() => timer === 0 && handleSendOTP()} className={`text-[10px] font-black uppercase tracking-widest transition-colors ${timer > 0 ? "text-gray-600" : "text-purple-400 hover:text-white"}`}>
                      {timer > 0 ? `Resend Signal in ${timer}s` : "Request New Code"}
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleSendOTP} 
                  disabled={isSendingOtp} 
                  className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] bg-purple-600 text-white shadow-xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {isSendingOtp ? "Initializing..." : "Generate OTP Signal"}
                </button>
              )}

              {/* Consent Section */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 group cursor-pointer" onClick={() => setIsChecked(!isChecked)}>
                <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isChecked ? "bg-purple-600 border-purple-600 shadow-[0_0_15px_rgba(124,58,237,0.4)]" : "border-white/10 bg-white/5"}`}>
                  {isChecked && <CheckCircle2 size={14} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 leading-tight group-hover:text-gray-300 transition-colors">
                    I authorize Aadhaar-based identity verification for secure DSC registration.
                  </span>
                  <span className="text-[8px] text-purple-500 font-black uppercase tracking-widest mt-1">Required Consent</span>
                </div>
              </div>

              {/* Final Verification Button */}
              <button
                onClick={handleVerify}
                disabled={!isChecked || isVerifying || otp.join("").length !== 6}
                className={`w-full py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-2 ${
                  isChecked && otp.join("").length === 6 && !isVerifying
                    ? "bg-white text-black shadow-2xl hover:bg-purple-600 hover:text-white"
                    : "bg-white/5 text-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                {isVerifying ? "Verifying Token..." : "Verify & Finalize →"}
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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}