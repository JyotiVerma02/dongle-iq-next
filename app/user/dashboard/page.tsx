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

    // eslint-disable-next-line react-hooks/unsupported-syntax
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
        p.update(); p.draw();
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

    init(); animate();
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener("resize", init); };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-linear-to-br from-[#f8fbff] to-[#f0f4f9]" />;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPricing({ certificate: cert, token: token, assisted: assisted, total: cert + token + assisted });
  }, [formData]);

  const isProductSelected = formData.certType !== "" && formData.validity !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!formData.name || !formData.email || !formData.mobile || !formData.certType || !formData.validity) {
      setError("⚠️ Please fill all required (*) fields");
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { alert("⚠️ Server Error"); }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      <ParticleBackground />
      <form onSubmit={handleSubmit} className="relative z-10 py-16 px-4">
        <div className="max-w-5xl mx-auto bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden border border-white/60">
          
          <div className="flex flex-col md:flex-row items-center p-10 md:p-14 gap-12">
            <div className="md:w-5/12 group">
              <img src="https://img.freepik.com/free-vector/electronic-signature-concept-illustration_114360-1010.jpg" alt="DSC" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
            </div>
            
            <div className="md:w-7/12">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-0.5 w-12 bg-blue-600"></div>
                <h1 className="text-4xl font-light text-slate-800 tracking-tight">DSC <span className="text-blue-600 font-black">ENROLLMENT</span></h1>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {[
                  { label: "Full Name", type: "text", key: "name" },
                  { label: "Email Address", type: "email", key: "email" },
                  { label: "Mobile Number", type: "tel", key: "mobile" },
                ].map((field) => (
                  <div key={field.key} className="relative group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{field.label} <span className="text-red-500">*</span></label>
                    <input
                      type={field.type}
                      value={formData[field.key as keyof FormDataType]}
                      className={`w-full border-2 rounded-2xl p-3.5 text-slate-800 font-semibold outline-none transition-all duration-300 hover:border-blue-200
                        ${submitted && !formData[field.key as keyof FormDataType] ? "border-red-300 bg-red-50/50" : "border-slate-100 bg-white/40 focus:border-blue-400 focus:bg-white focus:shadow-lg focus:shadow-blue-50"}`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      onChange={(e) => setFormData({ ...formData, [field.key as keyof FormDataType]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50/50 p-10 md:p-14 border-t border-slate-100/80">
            <div className="bg-white/80 rounded-3xl p-8 md:p-10 shadow-inner border border-white">
              <h2 className="text-center text-xs font-black text-slate-400 mb-10 tracking-[0.3em] uppercase">Service Configuration Module</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { label: "User Category", key: "userType", options: ["Individual", "Organization", "Foreign Individual"] },
                  { label: "Certificate Class", key: "classType", options: ["Class III"] },
                  { label: "Service Type", key: "certType", options: ["Encryption", "Signature", "Signing & Encryption"] },
                  { label: "Validity", key: "validity", options: ["1 Year", "2 Years", "3 Years"] },
                  { label: "USB Token", key: "tokenType", options: ["Not Required", "USB Token"] },
                  { label: "Assisted Service", key: "assistedService", options: ["Not Required", "Required"] },
                ].map((item) => (
                  <div key={item.key} className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">{item.label}</label>
                    <select
                      className="w-full border-2 border-slate-100 rounded-xl p-3 bg-white text-sm font-bold text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer hover:border-blue-200"
                      value={formData[item.key as keyof FormDataType]} 
                      onChange={(e) => setFormData({ ...formData, [item.key as keyof FormDataType]: e.target.value })}
                    >
                      {(item.key === "certType" || item.key === "validity") && <option value="">Select Option</option>}
                      {item.options.map((opt) => <option key={opt}>{opt}</option>)}
                    </select>
                  </div>
                ))}

                {/* --- FIXED: Price Placeholder Logic to remove blank gap --- */}
                <div className="md:col-span-1 lg:col-span-3">
                  {!isProductSelected ? (
                    <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center min-h-27.5">
                      <div className="flex gap-1.5 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-75"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-150"></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Service & Validity to view pricing</p>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border-2 border-slate-800 bg-white shadow-xl shadow-blue-50 animate-in fade-in zoom-in duration-500">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                          <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Total Investment</span>
                          <div className="text-4xl font-black text-slate-800">₹{pricing.total}</div>
                        </div>
                        <div className="flex gap-4 text-center">
                          <div className="px-4 border-r border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Cert</div>
                            <div className="font-bold text-slate-700">₹{pricing.certificate}</div>
                          </div>
                          <div className="px-4 border-r border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Token</div>
                            <div className="font-bold text-slate-700">₹{pricing.token}</div>
                          </div>
                          <div className="px-4">
                            <div className="text-[9px] font-bold text-slate-400 uppercase">Asst</div>
                            <div className="font-bold text-slate-700">₹{pricing.assisted}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl flex items-center gap-6 border border-slate-100">
                  <span className="text-[11px] font-black text-slate-400 uppercase">Verification eKYC:</span>
                  <div className="flex gap-6">
                    {["PAN", "Aadhaar"].map((type) => (
                      <label key={type} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="radio" name="ekyc" checked={formData.ekycType === type} onChange={() => setFormData({ ...formData, ekycType: type })} className="w-5 h-5 accent-blue-600" />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3">
                  {error && <p className="text-red-500 text-[11px] font-black uppercase italic animate-bounce">{error}</p>}
                  <button type="submit" className="group relative bg-slate-900 hover:bg-blue-600 text-white px-14 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all duration-300 hover:-translate-y-1 active:scale-95 overflow-hidden">
                    <span className="relative z-10">Generate Application →</span>
                    <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}