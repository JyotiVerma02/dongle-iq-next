/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Particle Class for the background
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

const ParticleBackground = () => {
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
      for (let i = 0; i < count; i++) particles.push(new Particle(canvas, ctx));
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
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    init(); animate();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", init); };
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#020203]" />;
};

const OtpInput = ({ value, onChange, onKeyDown, index, inputRef }: any) => (
  <input
    ref={inputRef}
    type="text"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    className="w-10 h-11 md:w-12 md:h-12 text-center text-xl font-bold border-2 border-white/10 rounded-xl focus:border-purple-500/50 focus:outline-none bg-white/5 text-white transition-all shadow-inner"
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
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden selection:bg-purple-500/30">
      <ParticleBackground />

      {/* Main Viewport Container - Exact same as your previous pages */}
      <div className="relative z-10 w-full max-w-[450px] bg-black/40 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_80px_rgba(168,85,247,0.1)] p-7 md:p-9 border border-purple-500/30 aspect-[4/5] flex flex-col items-stretch overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-light text-white uppercase tracking-tight">Aadhaar <span className="text-purple-500 font-black">Verification</span></h1>
          <div className="h-0.5 w-10 bg-purple-500 mx-auto mt-1.5 rounded-full shadow-[0_0_10px_#a855f7]"></div>
        </div>

        {/* Status Messages */}
        <div className="min-h-[20px] mb-2 text-center">
            {error && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">{error}</p>}
            {success && <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest">{success}</p>}
        </div>

        {/* Instruction Block */}
        <div className="bg-purple-500/5 rounded-2xl p-4 mb-6 border border-purple-500/10 text-center">
          <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
            Required for Digital Signature Certificate (DSC) <br/>
            <span className="text-purple-500 font-bold uppercase text-[10px] tracking-widest">Please enter Registered Mobile</span>
          </p>
        </div>

        {/* Input Fields */}
        <div className="flex-grow space-y-5">
          <div className="group">
            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Mobile Number</label>
            <input
              type="tel" maxLength={10} value={mobile} disabled={otpSent}
              placeholder="9876543210"
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              className="w-full border-2 border-white/5 bg-white/5 rounded-xl px-4 py-3 text-white font-bold outline-none focus:border-purple-500/40 transition-all text-base placeholder:text-slate-700"
            />
          </div>

          {otpSent ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <label className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 text-center">Enter 6-Digit OTP Code</label>
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <OtpInput key={index} index={index} value={digit} onChange={handleOtpChange} onKeyDown={handleOtpKeyDown} inputRef={(el: any) => (inputRefs.current[index] = el)} />
                ))}
              </div>
              <div className="flex justify-center">
                <button onClick={() => timer === 0 && handleSendOTP()} className={`text-[9px] font-black uppercase tracking-[0.1em] transition-colors ${timer > 0 ? "text-slate-600" : "text-purple-500 hover:text-purple-400 underline underline-offset-4"}`}>
                  {timer > 0 ? `Resend Code in ${timer}s` : "Resend OTP Code"}
                </button>
              </div>
            </div>
          ) : (
            <button onClick={handleSendOTP} disabled={isSendingOtp} className="w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.25em] bg-purple-600 text-white shadow-xl shadow-purple-900/20 hover:bg-purple-500 active:scale-95 transition-all">
              {isSendingOtp ? "Processing..." : "Send OTP"}
            </button>
          )}
        </div>

        {/* Consent Section */}
        <div className="flex items-start gap-4 mb-6 px-1">
          <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} className="mt-1 w-5 h-5 rounded border-2 border-white/10 text-purple-600 accent-purple-600 cursor-pointer shadow-inner" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400 leading-tight">I authorize verification of my Aadhaar details for DSC registration.</span>
            <span className="text-[8px] text-purple-500 font-black uppercase tracking-widest mt-1">Required Consent</span>
          </div>
        </div>

        {/* Footer Actions - ALWAYS AT THE BOTTOM */}
        <div className="mt-auto pt-2">
          <button
            onClick={handleVerify}
            disabled={!isChecked || isVerifying || otp.join("").length !== 6}
            className={`w-full py-4 rounded-xl font-black text-[11px] uppercase tracking-[0.25em] transition-all duration-500 ${
              isChecked && otp.join("").length === 6 && !isVerifying
                ? "bg-white text-black hover:bg-purple-600 hover:text-white shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-100"
                : "bg-white/5 text-slate-600 cursor-not-allowed border border-white/5 opacity-50"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify & Continue →"}
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-2">
             <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">🔒 End-to-End Encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
}