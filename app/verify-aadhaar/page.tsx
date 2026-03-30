/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Particle Background Component
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
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

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-linear-to-br from-[#f8fbff] to-[#f0f4f9]" />;
};

// OTP Input Component
const OtpInput = ({ value, onChange, onKeyDown, index, inputRef }: any) => {
  return (
    <input
      ref={inputRef}
      type="text"
      maxLength={1}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      onKeyDown={(e) => onKeyDown(index, e)}
      className="w-12 h-12 md:w-14 md:h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-white transition-all"
    />
  );
};

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

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input when OTP is sent
  useEffect(() => {
    if (otpSent) {
      inputRefs.current[0]?.focus();
    }
  }, [otpSent]);

  const handleSendOTP = async () => {
    if (!mobile) {
      setError("Please enter mobile number");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setError("");
    setIsSendingOtp(true);

    try {
      const res = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
          action: "send-otp"
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
        setTimer(120); // 2 minutes timer
        setSuccess("OTP sent successfully to your WhatsApp number!");
        setTimeout(() => setSuccess(""), 5000);
      } else {
        setError(data.message || "Failed to send OTP");
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("Failed to connect to server");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!isChecked) {
      setError("Please accept terms & conditions");
      return;
    }

    const otpValue = otp.join("");
    
    if (otpValue.length !== 6) {
      setError("Please enter complete 6-digit OTP");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const res = await fetch("/api/verify-aadhar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile,
          otp: otpValue,
          action: "verify"
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("✅ Aadhaar Verified Successfully!");

        // Store verification status in localStorage
        localStorage.setItem("aadhaarVerified", "true");
        localStorage.setItem("userMobile", mobile);

        setTimeout(() => {
          router.push("/bank-telecom-form");
        }, 1500);
      } else {
        setError(data.message || "Verification failed");
        // Clear OTP on failure
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        setTimeout(() => setError(""), 5000);
      }
    } catch (err) {
      setError("Failed to connect to verification server");
      setTimeout(() => setError(""), 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) {
      setError(`Please wait ${timer} seconds before requesting another OTP`);
      return;
    }
    
    // Clear OTP fields
    setOtp(["", "", "", "", "", ""]);
    await handleSendOTP();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center px-4 overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-110 bg-white/75 backdrop-blur-2xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 md:p-10 border border-white/60 transition-all duration-500">

        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight uppercase">
            Aadhaar <span className="text-blue-600 font-black">Verification</span>
          </h1>
          <div className="h-0.75 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
          <p className="text-sm text-slate-600 mt-3">
            Required for Digital Signature Certificate (DSC) registration
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Static Instruction Box */}
        <div className="bg-blue-600/5 rounded-md p-4 mb-4 border border-blue-100/50">
          <p className="text-[13px] md:text-[14px] text-slate-700 text-center font-medium leading-relaxed">
            Please enter your <br />
            <span className="text-blue-600 font-bold uppercase tracking-tighter">
              Aadhaar Registered Mobile Number
            </span>
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 mb-4">
          <div className="group">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
              Mobile Number
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ''));
                setOtpSent(false);
                setOtp(["", "", "", "", "", ""]);
              }}
              className="w-full border-2 border-slate-100 bg-white/60 rounded-lg px-4 py-3 text-base text-slate-800 font-medium outline-none transition-all focus:border-blue-500 focus:bg-white"
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <button
              onClick={handleSendOTP}
              disabled={isSendingOtp}
              className={`w-full py-3 rounded-lg font-black text-[12px] uppercase tracking-[0.2em] transition-all bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm ${isSendingOtp ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {isSendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          ) : (
            <>
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2 ml-1">
                  Enter 6-Digit OTP
                </label>
                <div className="flex justify-center gap-2 md:gap-3">
                  {otp.map((digit, index) => (
                    <OtpInput
                      key={index}
                      index={index}
                      value={digit}
                      onChange={handleOtpChange}
                      onKeyDown={handleOtpKeyDown}
                      inputRef={(el: HTMLInputElement | null) => {
                        inputRefs.current[index] = el;
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={handleResendOTP}
                  disabled={timer > 0}
                  className={`text-sm font-medium transition-colors ${
                    timer > 0 
                      ? "text-gray-400 cursor-not-allowed" 
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  {timer > 0 
                    ? `Resend OTP in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}` 
                    : "Resend OTP"}
                </button>
                <p className="text-xs text-gray-500">
                  OTP sent to {mobile}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Consent Section */}
        <div className="flex items-start gap-4 mb-4 px-1">
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => setIsChecked(!isChecked)}
              className="w-5 h-5 rounded-md border-2 border-slate-300 text-blue-600 accent-blue-600 cursor-pointer transition-transform active:scale-90"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] md:text-[13px] leading-snug font-bold text-slate-600">
              I authorize verification of my Aadhaar details for DSC registration.
            </span>
            <span className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-1">
              Consent Required
            </span>
          </div>
        </div>

        {/* Verify Button */}
        {otpSent && (
          <button
            onClick={handleVerify}
            disabled={!isChecked || isVerifying || otp.join("").length !== 6}
            className={`w-full py-4 rounded-lg font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 active:scale-95 ${
              isChecked && otp.join("").length === 6 && !isVerifying
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isVerifying ? "Verifying..." : "Verify & Continue →"}
          </button>
        )}

        {/* Security Note */}
        <div className="mt-6 text-center">
          <p className="text-[10px] text-slate-500">
            🔒 Your Aadhaar details are encrypted and securely stored
          </p>
        </div>
      </div>
    </div>
  );
}