/* eslint-disable react-hooks/unsupported-syntax */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

// --- Animated Particle Background Component ---
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
      x: number; y: number; vx: number; vy: number; size: number;
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.vx = (Math.random() - 0.5) * 0.3; 
        this.vy = (Math.random() - 0.5) * 0.3;
        this.size = Math.random() * 1.2 + 0.5;
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
        ctx!.fillStyle = "rgba(168, 85, 247, 0.3)"; 
        ctx!.fill();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
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
          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
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

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#0a0a0c]" />;
};

type FormDataType = {
  name: string; email: string; mobile: string;
  userType: string; classType: string; certType: string;
  validity: string; tokenType: string; assistedService: string; ekycType: string;
};

export default function DSCRegistrationForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "", email: "", mobile: "",
    userType: "Individual", classType: "Class III",
    certType: "", validity: "",
    tokenType: "Not Required", assistedService: "Not Required", ekycType: "PAN",
  });

  const [pricing, setPricing] = useState({ certificate: 0, token: 0, assisted: 0, total: 0 });

  useEffect(() => {
    let cert = 0;
    if (formData.certType === "Signing & Encryption") {
      if (formData.validity === "1 Year") cert = 1200;
      if (formData.validity === "2 Years") cert = 1779;
      if (formData.validity === "3 Years") cert = 2400;
    } else if (formData.certType === "Signature") cert = 800;
    const token = formData.tokenType === "USB Token" ? 500 : 0;
    const assisted = formData.assistedService === "Required" ? 355 : 0;
    setPricing({ certificate: cert, token: token, assisted: assisted, total: cert + token + assisted });
  }, [formData]);

  const isProductSelected = formData.certType !== "" && formData.validity !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!formData.name || !formData.email || !formData.mobile || !formData.certType || !formData.validity) {
      setError("⚠️ Required fields missing");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/user-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalAmount: pricing.total }),
      });
      const data = await res.json();
      if (data.success) router.push(formData.ekycType === "Aadhaar" ? "/verify-aadhaar" : "/verify");
      else alert("❌ Failed");
    } catch (error) { alert("⚠️ Server Error"); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 selection:bg-purple-500/30 selection:text-purple-200 pt-34">
      <ParticleBackground />
      
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-6xl flex flex-col gap-8">
        
        {/* PANEL 1: Image + DSC Enrollment (Unified Box) */}
        <div className="flex flex-col md:flex-row gap-8 items-center bg-black/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)] p-10">
          <div className="md:w-5/12 flex justify-center">
            <img 
              src="/dscform-removebg-preview.png" 
              alt="DSC" 
              className="w-full max-w-sm h-auto opacity-80 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-transform duration-700 hover:scale-105" 
            />
          </div>
          
          <div className="md:w-7/12 w-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-0.5 w-12 bg-purple-500"></div>
              <h1 className="text-4xl font-light text-white tracking-tight uppercase">DSC <span className="text-purple-500 font-black">Enrollment</span></h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[
                { label: "Full Name", type: "text", key: "name" },
                { label: "Email Address", type: "email", key: "email" },
                { label: "Mobile Number", type: "tel", key: "mobile" },
              ].map((field) => (
                <div key={field.key} className="relative group">
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">
                    {field.label} <span className="text-purple-400">*</span>
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.key as keyof FormDataType]}
                    className={`w-full border-2 rounded-2xl p-4 text-white font-semibold outline-none transition-all duration-300 border-white/5 bg-white/5 focus:border-purple-500/50 focus:bg-white/10`}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    onChange={(e) => setFormData({ ...formData, [field.key as keyof FormDataType]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* PANEL 2: Service Configuration (Separate Box with Border Effect) */}
        <div className="bg-black/40 backdrop-blur-xl rounded-[2.5rem] border-2 border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.2)] p-10 md:p-14">
          <h2 className="text-center text-xs font-black text-slate-500 mb-10 tracking-[0.4em] uppercase">Service Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: "User Category", key: "userType", options: ["Individual", "Organization", "Foreign Individual"], required: false },
              { label: "Certificate Class", key: "classType", options: ["Class III"], required: false },
              { label: "Service Type", key: "certType", options: ["Encryption", "Signature", "Signing & Encryption"], required: true },
              { label: "Validity", key: "validity", options: ["1 Year", "2 Years", "3 Years"], required: true },
              { label: "USB Token", key: "tokenType", options: ["Not Required", "USB Token"], required: false },
              { label: "Assisted Service", key: "assistedService", options: ["Not Required", "Required"], required: false },
            ].map((item) => (
              <div key={item.key} className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">
                  {item.label} {item.required && <span className="text-purple-500">*</span>}
                </label>
                <select
                  className="w-full border-2 border-white/5 rounded-xl p-3.5 bg-white/5 text-sm font-bold text-white outline-none focus:border-purple-500 transition-all cursor-pointer hover:bg-white/10"
                  value={formData[item.key as keyof FormDataType]} 
                  onChange={(e) => setFormData({ ...formData, [item.key as keyof FormDataType]: e.target.value })}
                >
                  {(item.key === "certType" || item.key === "validity") && <option value="" className="bg-slate-900">Select Option</option>}
                  {item.options.map((opt) => <option key={opt} value={opt} className="bg-slate-900">{opt}</option>)}
                </select>
              </div>
            ))}

            {/* Price Table and Footer Integrated here */}
            <div className="md:col-span-2 lg:col-span-3 mt-4">
              {!isProductSelected ? (
                <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center justify-center min-h-[100px]">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Service Type & Validity to see pricing</p>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-purple-500/30 bg-purple-500/5 flex flex-col md:flex-row items-center justify-between gap-8 animate-in fade-in zoom-in duration-500">
                  <div className="text-center md:text-left">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Total Investment</span>
                    <div className="text-4xl font-black text-white">₹{pricing.total}</div>
                  </div>
                  
                  <div className="flex gap-6 text-center text-slate-300">
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-500">Cert</div>
                      <div className="font-bold">₹{pricing.certificate}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-500">Token</div>
                      <div className="font-bold">₹{pricing.token}</div>
                    </div>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                      <div className="text-[9px] font-bold uppercase text-slate-500">Asst</div>
                      <div className="font-bold">₹{pricing.assisted}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Area */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12 mt-10 border-t border-white/5">
            <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/5 flex items-center gap-6">
               <span className="text-[11px] font-black text-slate-400 uppercase">eKYC Mode:</span>
               <div className="flex gap-6">
                 {["PAN", "Aadhaar"].map((type) => (
                   <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                     <input type="radio" checked={formData.ekycType === type} onChange={() => setFormData({ ...formData, ekycType: type })} className="w-5 h-5 accent-purple-500" />
                     <span className="text-sm font-bold text-slate-300 group-hover:text-purple-400 transition-colors">{type}</span>
                   </label>
                 ))}
               </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3">
              {error && <p className="text-red-400 text-[11px] font-black uppercase animate-pulse">{error}</p>}
              <button type="submit" className="group relative bg-white text-black px-14 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden">
                <span className="relative z-10 group-hover:text-white transition-colors duration-300">Generate Application →</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}