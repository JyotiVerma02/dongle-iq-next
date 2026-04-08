/* eslint-disable react-hooks/unsupported-syntax */
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

// --- OTP BOX COMPONENT ---
const OtpInput = ({ value, onChange, onKeyDown, index, inputRef }: any) => (
  <input
    ref={inputRef}
    type="text"
    maxLength={1}
    value={value}
    onChange={(e) => onChange(index, e.target.value)}
    onKeyDown={(e) => onKeyDown(index, e)}
    className="w-9 h-10 md:w-10 md:h-11  text-center text-xl font-black bg-black/40 border border-white/10 rounded-md focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 outline-none text-white transition-all shadow-2xl"
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
    if (timer > 0)
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (otpSent) inputRefs.current[0]?.focus();
  }, [otpSent]);

  const handleSendOTP = async () => {
    if (!/^\d{10}$/.test(mobile))
      return setError("Enter valid 10-digit number");
    setError("");
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, action: "send-otp" }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setTimer(120);
        setSuccess("OTP sent successfully!");
      } else setError(data.message || "Failed to send OTP");
    } catch (err) {
      setError("Connection error");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Allow only numbers
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // 👉 Move to next input automatically
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    // 👉 Move back when deleting
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
      if (data.success) {
        setSuccess("✅ Verified!");
        setTimeout(() => router.push("/bank-telecom-form"), 1000);
      } else {
        setError(data.message || "Failed");
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError("Server error");
    } finally {
      setIsVerifying(false);
    }
  };
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <main className="flex-1 flex items-center justify-center w-full p-4 mt-40">
      <div className="relative group w-full max-w-sm animate-[fadeIn_0.8s_ease-out]">
        {/* Glow Border */}
        <div className="absolute -inset-px bg-linear-to-r from-purple-600 via-transparent to-purple-600 rounded-xl opacity-30 blur-sm group-hover:opacity-100 transition-opacity" />

        {/* CARD */}
        <div className="relative bg-black/40 backdrop-blur-2xl rounded-xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Heading */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">
              Aadhaar <span className="text-purple-500">Verification</span>
            </h1>
          </div>

          {/* Messages */}
          {(error || success) && (
            <div className="mb-3 text-center text-[10px] font-black uppercase">
              {error && <p className="text-red-400">{error}</p>}
              {success && <p className="text-purple-400">{success}</p>}
            </div>
          )}

          {/* Info */}
          <div className="bg-purple-600/10 rounded-md p-2 mb-4 text-[10px] text-gray-300 text-center">
            Enter Aadhaar linked mobile number
          </div>

          <div className="space-y-4">
            {/* Mobile */}
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              disabled={otpSent}
              placeholder="Mobile Number"
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              className="w-full p-2.5 text-xs rounded-lg bg-black/40 border border-white/10 text-white outline-none"
            />

            {/* OTP */}
            {otpSent && (
              <div className="space-y-3 text-center">
                <div className="flex justify-center gap-1.5">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRef.current = el;
                      }}
                      value={digit}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-8 h-8 text-center text-xs rounded bg-black/40 border border-white/10 text-white outline-none focus:border-purple-500"
                    />
                  ))}
                </div>

                <button
                  onClick={() => timer === 0 && handleSendOTP()}
                  className="text-[9px] text-purple-400"
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </button>
              </div>
            )}

            {/* Send OTP */}
            {!otpSent && (
              <button
                onClick={handleSendOTP}
                disabled={isSendingOtp}
                className="w-full py-2 text-[11px] bg-purple-600 text-white rounded-lg"
              >
                {isSendingOtp ? "Sending..." : "Send OTP"}
              </button>
            )}

            {/* Checkbox */}
            <div
              className="flex items-center gap-2 text-[10px] text-gray-400 cursor-pointer"
              onClick={() => setIsChecked(!isChecked)}
            >
              <div
                className={`w-4 h-4 rounded border ${isChecked ? "bg-purple-600" : "border-white/20"}`}
              />
              Consent for verification
            </div>

            {/* Verify */}
            <button
              onClick={handleVerify}
              disabled={!isChecked || otp.join("").length !== 6}
              className={`w-full py-2 text-[11px] font-black rounded-lg ${
                isChecked && otp.join("").length === 6
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
