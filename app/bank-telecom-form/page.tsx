/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// Reuse the ParticleBackground from your other pages for consistency
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let particles: any[] = [];
    let animationFrameId: number;
    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 15000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          size: Math.random() * 1.5 + 0.5,
        });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
        ctx.fill();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    init(); animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none bg-[#020203]" />;
};

export default function DongleIQForm() {
  const router = useRouter();
  const photoRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const idProofRef = useRef<HTMLInputElement>(null);

  const initialState = {
    name: "", gender: "", dob: "", pan: "", email: "", mobile: "7295014037",
    ekycId: "", ekycPin: "", bpCode: "", address: "", pincode: "", city: "",
    state: "", certificateClass: "Class III", tokenType: "Not Required",
    certType: "Signing", validity: "2 Years", addressProof: "", idProof: "",
    bpAvailable: "Yes", internalRemarks: "", photo: "", price: 1245
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(1200);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [addressFile, setAddressFile] = useState<string>("No file chosen");
  const [idFile, setIdFile] = useState<string>("No file chosen");
  const [photoFile, setPhotoFile] = useState<string>("");

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (timeLeft <= 0) {
      alert("Session Expired! Please verify your mobile again.");
      router.push("/verify-mobile");
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, router]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!formData.name || !formData.pan || !formData.email || !formData.address || !formData.ekycPin) {
      alert("⚠️ Please fill all required fields marked with *");
      return;
    }
    if (!formData.addressProof || !formData.idProof || !formData.photo) {
      alert("⚠️ Please upload all required files (Address Proof, ID Proof, and Photo)");
      return;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan)) {
      alert("⚠️ Invalid PAN format (Example: ABCDE1234F)");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ Form Submitted Successfully!");
        setFormData(initialState);
        setAddressFile("No file chosen");
        setIdFile("No file chosen");
        setPhotoFile("");
        router.push("/admin/dashboard");
      } else {
        alert("❌ Error: " + (data.message || "Something went wrong!"));
      }
    } catch (error) {
      alert("❌ Critical Error: Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-purple-500/30 pb-10 pt-28">
      <ParticleBackground />
      
      

      <div className="max-w-6xl mx-auto p-4 lg:p-8">
        <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden border border-purple-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* Settings Bar */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-6 bg-purple-500/5 border-b border-purple-500/20 items-end">
            <Select name="certificateClass" label="Class" options={["Class III"]} value={formData.certificateClass} onChange={handleChange} />
            <Select name="tokenType" label="Token" options={["Not Required", "Required"]} value={formData.tokenType} onChange={handleChange} />
            <Select name="certType" label="Type" options={["Signing", "Encryption", "Both"]} value={formData.certType} onChange={handleChange} />
            <Select name="validity" label="Validity" options={["2 Years", "1 Year"]} value={formData.validity} onChange={handleChange} />
            <div className="text-right pb-1">
              <span className="text-white font-black text-2xl drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">₹{formData.price}</span>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input name="name" label="Name as per PAN" placeholder="ENTER FULL NAME" value={formData.name} onChange={handleChange} required />
              <Select name="gender" label="Gender" options={["Select Gender", "Male", "Female"]} value={formData.gender} onChange={handleChange} required />
              <Input name="dob" label="Date of Birth" placeholder="DD-MM-YYYY" value={formData.dob} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input name="pan" label="PAN No" placeholder="ABCDE1234F" value={formData.pan} onChange={handleChange} required />
              <Input name="email" label="Email Address" type="email" placeholder="EMAIL@EXAMPLE.COM" value={formData.email} onChange={handleChange} required />
              <Input name="mobile" label="Mobile No" readOnly value={formData.mobile} required className="bg-white/5 border-white/5 text-slate-500 cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input name="ekycId" label="eKYC ID" placeholder="mobile@dongle-iq" value={formData.ekycId} onChange={handleChange} required />
              <div>
                <label className="text-[9px] font-black block mb-2 text-slate-500 uppercase tracking-widest ml-1">eKYC PIN<span className="text-purple-500">*</span></label>
                <div className="flex h-12 shadow-inner">
                  <input name="ekycPin" type={showPin ? "text" : "password"} value={formData.ekycPin} onChange={handleChange} className="w-full border-2 border-white/10 bg-white/5 px-4 text-[14px] font-bold rounded-l-xl focus:border-purple-500/40 outline-none text-white" placeholder="6 DIGIT PIN" required />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="bg-purple-600/20 text-purple-400 px-4 rounded-r-xl border-2 border-l-0 border-white/10 hover:bg-purple-600 hover:text-white transition-all">{showPin ? "🔓" : "🔒"}</button>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black block mb-2 text-slate-500 uppercase tracking-widest ml-1">BP Code</label>
                <input name="bpCode" value={formData.bpCode} onChange={handleChange} className="w-full border-2 border-white/10 bg-white/5 h-12 px-4 text-[14px] font-bold rounded-xl focus:border-purple-500/40 outline-none text-white" placeholder="REFERENCE CODE" />
                <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  <span className="text-purple-500/60">BP Available?</span>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="radio" name="bpAvailable" value="Yes" checked={formData.bpAvailable === "Yes"} onChange={handleChange} className="accent-purple-500 w-3 h-3" /> YES</label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white"><input type="radio" name="bpAvailable" value="No" checked={formData.bpAvailable === "No"} onChange={handleChange} className="accent-purple-500 w-3 h-3" /> NO</label>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black block mb-2 text-slate-500 uppercase tracking-widest ml-1">Full Residential Address<span className="text-purple-500">*</span></label>
              <textarea name="address" placeholder="Enter complete address as per records" value={formData.address} onChange={handleChange} required className="w-full border-2 border-white/10 bg-white/5 min-h-[100px] p-4 text-[14px] font-bold rounded-2xl focus:border-purple-500/40 outline-none text-white placeholder:text-slate-700 resize-none transition-all shadow-inner" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input name="pincode" label="Pincode" placeholder="600001" value={formData.pincode} onChange={handleChange} required />
              <Input name="city" label="City" placeholder="CITY NAME" value={formData.city} onChange={handleChange} required />
              <Input name="state" label="State" placeholder="STATE NAME" value={formData.state} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FileComponent label="Address Proof (PDF/JPG)" inputRef={addressRef} fileName={addressFile} setFile={(name: string) => { setAddressFile(name); setFormData(p => ({...p, addressProof: name}))}} />
              <FileComponent label="Identity Proof (PDF/JPG)" inputRef={idProofRef} fileName={idFile} setFile={(name: string) => { setIdFile(name); setFormData(p => ({...p, idProof: name}))}} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] font-black block mb-3 text-slate-500 uppercase tracking-widest ml-1">Applicant Photo<span className="text-purple-500">*</span></label>
                <input type="file" ref={photoRef} className="hidden" onChange={(e) => {
                    const name = e.target.files?.[0]?.name || "";
                    setPhotoFile(name);
                    setFormData(p => ({...p, photo: name}));
                }} />
                <div onClick={() => photoRef.current?.click()} className="border-2 border-dashed border-purple-500/30 bg-purple-500/5 h-40 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-500/10 hover:border-purple-500/50 transition-all group shadow-inner">
                  <div className="bg-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform">
                    <span className="text-xl">{photoFile ? "✅" : "☁️"}</span>
                  </div>
                  <p className="text-purple-400 font-black text-[10px] uppercase tracking-widest">{photoFile || "Click to Upload Photo"}</p>
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black block mb-3 text-slate-500 uppercase tracking-widest ml-1">Internal Remarks</label>
                <textarea name="internalRemarks" value={formData.internalRemarks} onChange={handleChange} className="w-full border-2 border-white/10 bg-white/5 p-4 text-[14px] font-bold rounded-2xl h-40 resize-none outline-none text-white shadow-inner placeholder:text-slate-700" placeholder="Add any specific notes for processing..." />
              </div>
            </div>
          </div>

          <div className="p-8 bg-purple-500/5 border-t border-purple-500/20 flex flex-col items-center gap-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-white text-black hover:bg-purple-600 hover:text-white px-24 py-4 rounded-xl font-black text-[12px] transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] uppercase tracking-[0.3em] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Proceed to Summary →"}
            </button>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
               <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
               Encrypted & Secure Session
               <span className="w-1 h-1 bg-purple-500 rounded-full animate-pulse"></span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, required, className = "", ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[9px] font-black block mb-2 text-slate-500 uppercase tracking-widest ml-1">{label}{required && <span className="text-purple-500">*</span>}</label>
      <input {...props} className={`w-full border-2 border-white/10 bg-white/5 h-12 px-4 text-[14px] font-bold rounded-xl focus:border-purple-500/40 outline-none text-white placeholder:text-slate-700 transition-all shadow-inner ${className}`} />
    </div>
  );
}

function Select({ label, options, required, ...props }: any) {
  return (
    <div className="w-full">
      <label className="text-[9px] font-black block mb-2 text-slate-500 uppercase tracking-widest ml-1">{label}{required && <span className="text-purple-500">*</span>}</label>
      <select {...props} className="w-full border-2 border-white/10 bg-white/5 h-12 px-3 text-[14px] font-bold rounded-xl focus:border-purple-500/40 outline-none text-white bg-[#1a1a1c] cursor-pointer shadow-inner transition-all appearance-none">
        {options.map((o: string) => <option key={o} value={o} className="bg-[#1a1a1c]">{o}</option>)}
      </select>
    </div>
  );
}

function FileComponent({ label, inputRef, fileName, setFile }: any) {
  return (
    <div className="w-full">
      <label className="text-[9px] font-black block mb-3 text-slate-500 uppercase tracking-widest ml-1">{label}<span className="text-purple-500">*</span></label>
      <div className="flex items-center gap-4 bg-white/5 border-2 border-white/10 p-2 rounded-xl shadow-inner">
        <input type="file" ref={inputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0]?.name || "No file chosen")} />
        <button type="button" onClick={() => inputRef.current.click()} className="bg-purple-600/20 text-purple-400 border border-purple-500/30 px-5 py-2 text-[10px] font-black rounded-lg hover:bg-purple-600 hover:text-white transition-all uppercase tracking-widest">Attach</button>
        <span className="text-[10px] text-slate-400 font-bold italic truncate flex-grow pr-2">{fileName}</span>
      </div>
    </div>
  );
}