"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  // User, Users, ChevronRight, Search,
  Smartphone,
  Zap,
  Fingerprint,
  ShieldCheck,
  ArrowLeft,
  Mail,
  Cpu,
  Hash,
  Calendar,
  Users,
  User,
  ChevronRight,
} from "lucide-react";
import UserLedgerView from "@/components/UserLedger";
import UserDongleView from "@/components/UserDongle";
// --- SHARED PARTICLE BACKGROUND (Matches your other pages) ---
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
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
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
        ctx!.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx!.fill();
      }
    }
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 20000);
      for (let i = 0; i < count; i++) particles.push(new Particle());
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
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
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#f8fbff]"
    />
  );
};

export default function DongleIQAdminHub() {
  const [view, setView] = useState<"home" | "admin" | "ledger" | "dongle">("home");

  const raviProfile = {
    _id: "69bbc4118f66fba161167eec",
    name: "Ravi Kaliya",
    email: "ravi.k@webshlok.com",
    number: "7835025024",
    role: "Admin",
    isVerified: true,
    status: "Active",
    otp: "306940",
    createdAt: "2026-03-19",
  };

  return (
    <div className="min-h-screen selection:bg-blue-100 selection:text-blue-900 font-sans p-6 md:p-12">
      <ParticleBackground />

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-slate-800 tracking-tight uppercase">
            Dongle <span className="text-blue-600 font-black">IQ</span> Hub
          </h1>
          <p className="text-[10px] md:text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
            Infrastructure <span className="text-blue-500">Management</span>{" "}
            Terminal
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/60 backdrop-blur-xl p-2 pr-6 rounded-full border border-white shadow-sm">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            R
          </div>
          <div className="text-left">
            <p className="text-xs font-black text-slate-800 uppercase">
              Ravi Kaliya
            </p>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">
              System Root
            </p>
          </div>
        </div>
      </header>

      {/* --- HOME VIEW --- */}
      {view === "home" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <MenuCard
            title="Admin Profile"
            desc="Manage system-wide permissions, security keys, and administrative credentials."
            icon={<ShieldCheck size={28} />}
            accent="blue"
            onClick={() => setView("admin")}
          />
          <MenuCard
            title="User Ledger"
            desc="Monitor registered agents and real-time identity verification statuses."
            icon={<Users size={24} />}
            accent="green"
            onClick={() => setView("ledger")} // Change this line
          />
          <MenuCard
            title="User Dongle"
            desc="Technical vault for hardware serials, firmware versions, and SIM integrations."
            icon={<Cpu size={28} />}
            accent="blue"
            onClick={() => setView("dongle")} // Change this line
          />
        </div>
      )}

      {/* --- ADMIN PROFILE VIEW --- */}
      {view === "admin" && (
        <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
          <button
            onClick={() => setView("home")}
            className="group flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 font-black text-[10px] tracking-[0.2em] transition-all uppercase"
          >
            <ArrowLeft
              size={14}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Return to Hub
          </button>

          <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-8 md:p-12 border-b border-slate-100/50 flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <div className="w-28 h-28 bg-linear-to-tr from-blue-600 to-blue-400 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-3">
                  <User size={50} className="text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#16a34a] p-2.5 rounded-2xl border-4 border-white shadow-lg">
                  <Fingerprint size={18} className="text-white" />
                </div>
              </div>

              <div className="text-center md:text-left flex-1">
                <h2 className="text-4xl font-black text-slate-800 tracking-tighter mb-2 italic">
                  {raviProfile.name.split(" ")[0]}{" "}
                  <span className="text-blue-600 not-italic">
                    {raviProfile.name.split(" ")[1]}
                  </span>
                </h2>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded-xl tracking-widest border border-blue-100">
                    {raviProfile.role} Account
                  </span>
                  <span className="px-4 py-1.5 bg-emerald-50 text-[#16a34a] text-[10px] font-black uppercase rounded-xl tracking-widest border border-emerald-100 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-[#16a34a] rounded-full animate-pulse" />{" "}
                    Identity Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AdminDetailBox
                label="Registry ID"
                value={raviProfile._id}
                icon={<Hash size={14} />}
              />
              <AdminDetailBox
                label="Secure Email"
                value={raviProfile.email}
                icon={<Mail size={14} />}
              />
              <AdminDetailBox
                label="Contact"
                value={raviProfile.number}
                icon={<Smartphone size={14} />}
              />
              <AdminDetailBox
                label="Auth Status"
                value={raviProfile.status}
                icon={<ShieldCheck size={14} />}
              />
              <AdminDetailBox
                label="Session OTP"
                value={raviProfile.otp}
                icon={<Zap size={14} />}
                color="text-blue-600"
              />
              <AdminDetailBox
                label="Registry Date"
                value={raviProfile.createdAt}
                icon={<Calendar size={14} />}
              />
            </div>

            <div className="bg-slate-50/50 p-6 text-center border-t border-slate-100/50">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Secure Encrypted Terminal — Access ID:{" "}
                {raviProfile._id.slice(-8)}
              </p>
            </div>
          </div>
        </div>
      )}
      {view === "ledger" && (
  <UserLedgerView onBack={() => setView("home")} />
)}
{view === "dongle" && (
  <UserDongleView onBack={() => setView("home")} />
)}
    </div>
  );
}

// --- BEAUTIFIED SUB-COMPONENTS ---

interface MenuCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  accent: "blue" | "green";
  onClick: () => void;
}

function MenuCard({ title, desc, icon, accent, onClick }: MenuCardProps) {
  const isGreen = accent === "green";
  return (
    <div
      onClick={onClick}
      className="group relative bg-white/70 backdrop-blur-xl border border-white p-10 rounded-[3rem] cursor-pointer 
                 transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_40px_80px_-20px_rgba(59,130,246,0.12)]"
    >
      <div
        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 
                      ${isGreen ? "bg-emerald-50 text-[#16a34a] group-hover:bg-[#16a34a]" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600"} 
                      group-hover:text-white group-hover:rotate-6 group-hover:scale-110 shadow-sm`}
      >
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tighter group-hover:text-blue-600 transition-colors uppercase">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-10 font-medium">
        {desc}
      </p>
      <div
        className={`flex items-center font-black text-[10px] uppercase tracking-[0.3em] transition-all group-hover:translate-x-3
                      ${isGreen ? "text-[#16a34a]" : "text-blue-600"}`}
      >
        Open Terminal <ChevronRight size={14} className="ml-1" />
      </div>
    </div>
  );
}

interface AdminDetailBoxProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color?: string;
}

function AdminDetailBox({
  label,
  value,
  icon,
  color = "text-slate-800",
}: AdminDetailBoxProps) {
  return (
    <div className="bg-white/40 border border-white p-6 rounded-4xl hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all group">
      <div className="flex items-center gap-2 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors">
        {icon}
        <p className="text-[9px] font-black uppercase tracking-[0.2em]">
          {label}
        </p>
      </div>
      <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
    </div>
  );
}
