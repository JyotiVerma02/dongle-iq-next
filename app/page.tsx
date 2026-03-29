/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import yourPng from "@/public/dsc-kyc-verification.webp";
import {
  Cpu, ArrowRight, Mail, MessageSquare, ChevronDown, ChevronUp,
  UserPlus, LogIn, MousePointerClick, Fingerprint, Download,
  Briefcase, UserCheck, Coffee, Store, GraduationCap, Sun, Moon,
  ShieldCheck, Zap, Award, Globe, History, RefreshCw
} from "lucide-react";

import { useTheme } from "@/app/context/ThemeContext";
import { getThemeConfig } from "@/app/utils/themeConfig";

export default function DongleIQLanding() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const { isDarkMode, toggleTheme } = useTheme();
  const theme = getThemeConfig(isDarkMode);

  const faqs = [
    { q: "What is a Digital Signature Certificate (DSC)?", a: "A Digital Signature Certificate is an electronic form of a signature that helps authenticate the identity of an individual or organization in digital communications." },
    { q: "Why do I need a Digital Signature Certificate?", a: "You need a DSC to securely sign digital documents, file returns (Income Tax, GST), and participate in e-tendering." },
    { q: "Who issues a Digital Signature Certificate?", a: "DSCs are issued by licensed Certifying Authorities (CAs) authorized by the CCA, Government of India." },
    { q: "What are the types of Digital Signature Certificates?", a: "Main types include Class 3 (e-tendering/high security) and DGFT DSC (foreign trade)." },
    { q: "How long is a Digital Signature Certificate valid?", a: "A DSC is usually issued with a validity of 1, 2, or 3 years." },
    { q: "What documents are required to apply for a DSC?", a: "Identity Proof (PAN, Aadhaar) and Address Proof are typically required." },
    { q: "How can I use a Digital Signature Certificate?", a: "It is used via a secure USB Token inserted into your computer's USB port." },
    { q: "Can a Digital Signature Certificate be revoked?", a: "Yes, if the private key is compromised or the user requests revocation." }
  ];

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans antialiased transition-colors duration-300`}>

      {/* --- HEADER --- */}
      <nav className={`fixed top-0 w-full z-50 p-5 ${theme.nav} backdrop-blur-xl border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/")}>
            <div className={`${theme.accent} w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20`}>
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg uppercase tracking-tighter">
              Dongle<span className="text-purple-500">IQ</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            {["Apply", "Why Us", "Agents", "FAQs"].map((link) => (
              <a key={link} href={`#${link.toLowerCase().replace(" ", "")}`} className="hover:text-purple-500 transition-colors">{link}</a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border ${theme.border} hover:bg-purple-500/10 transition-all shadow-sm`}
            >
              {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-purple-600" />}
            </button>
            <button onClick={() => router.push("/login")} className="hidden sm:flex text-xs font-bold uppercase gap-2 items-center hover:text-purple-500 transition-colors">
              <LogIn size={14} /> Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className={`${theme.accent} px-5 py-2.5 rounded-xl text-xs font-bold uppercase text-white shadow-lg shadow-purple-500/20 hover:scale-105 transition-all`}
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO --- */}
      <section className="pt-44 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-500 text-[10px] font-bold uppercase tracking-widest mb-8">
              Certified DSC Partner
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-8 uppercase italic">
              Secure Digital <br /> <span className="text-purple-500">Identity.</span>
            </h1>
            <p className={`${theme.textMuted} text-lg mb-10 max-w-md leading-relaxed`}>
              Simplifying IRCTC Agent IDs and Digital Signature Certificates for professionals across India.
            </p>
            <button className={`${theme.accent} px-8 py-4 rounded-2xl text-sm font-bold uppercase text-white flex items-center gap-3 hover:scale-105 transition-transform shadow-xl shadow-purple-500/20`}>
              Start Application <ArrowRight size={18} />
            </button>
          </div>
          <div className="relative h-[350px] md:h-[450px]">
            <Image src={yourPng} alt="Preview" fill className="object-contain drop-shadow-2xl" priority />
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US (UPDATED FROM IMAGES) --- */}
      <section id="whyus" className="py-24 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Why Choose <span className="text-purple-500">Us?</span></h2>
            <div className="h-1 w-20 bg-purple-600 mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard theme={theme} icon={<Zap size={32} />} title="Fast & Paperless" desc="Apply for your Digital Signature Certificate online and receive it within minutes." />
            <FeatureCard theme={theme} icon={<History size={32} />} title="Government Licensed" desc="We are a certified authority trusted by the government since 2008." />
            <FeatureCard theme={theme} icon={<Fingerprint size={32} />} title="Instant Approval" desc="100% paperless verification using Aadhaar eKYC for quick issuance." />
            <FeatureCard theme={theme} icon={<MessageSquare size={32} />} title="24/7 Support" desc="Our team responds in less than 5 minutes to help with any queries." />
            <FeatureCard theme={theme} icon={<ShieldCheck size={32} />} title="Global Security" desc="2048-bit encryption ensures your DSC is secure and compliant." />
            <FeatureCard theme={theme} icon={<RefreshCw size={32} />} title="Unlimited Re-issuance" desc="Need a re-issuance? It’s unlimited and hassle-free for partners." />
          </div>
        </div>
      </section>

      {/* --- HOW TO APPLY (UPDATED FROM IMAGES) --- */}
      <section id="apply" className={`py-24 px-6 ${isDarkMode ? "bg-[#0a0e17]" : "bg-white"} border-y ${theme.border}`}>
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase mb-20 tracking-tighter">How To <span className="text-purple-500">Apply?</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <StepItem number="01" theme={theme} icon={<MousePointerClick />} title="Apply Online" desc="Click on 'Apply Now', choose your DSC type, and start your application." />
            <StepItem number="02" theme={theme} icon={<UserPlus />} title="Verify Identity" desc="Complete the secure Aadhaar eKYC process in under 2 minutes." />
            <StepItem number="03" theme={theme} icon={<Download />} title="Download DSC" desc="Install your Digital Signature Certificate instantly after verification." />
          </div>
        </div>
      </section>

      {/* --- AGENTS SECTION (MATCHING IMAGE ROLES) --- */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase mb-16 tracking-tighter">Who can become an <span className="text-purple-500">Agent?</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <AgentCard theme={theme} icon={<Briefcase />} label="Self-Employed" />
            <AgentCard theme={theme} icon={<Coffee />} label="Freelancers" />
            <AgentCard theme={theme} icon={<UserCheck />} label="Retired Person" />
            <AgentCard theme={theme} icon={<Store />} label="Retailer" />
            <AgentCard theme={theme} icon={<GraduationCap />} label="College Student" />
          </div>
        </div>
      </section>

      {/* --- FAQS --- */}
      <section id="faqs" className={`py-24 px-6 ${isDarkMode ? "bg-[#0a0e17]" : "bg-white"} border-t ${theme.border}`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12 uppercase tracking-tighter">Common <span className="text-purple-500">Queries</span></h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem key={i} theme={theme} index={i} active={openFaq} setActive={setOpenFaq} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className="py-24 px-6 mb-20">
        <div className={`max-w-5xl mx-auto ${theme.card} border ${theme.border} rounded-[40px] p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-16 shadow-2xl relative overflow-hidden`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20" />
          <div>
            <h2 className="text-4xl font-black uppercase mb-6 tracking-tighter">Contact <span className="text-purple-500">Us</span></h2>
            <p className={theme.textMuted}>Our Gurugram-based support team is here for you.</p>
            <div className="mt-8 space-y-4 font-bold text-sm tracking-tight">
              <div className="flex items-center gap-4 hover:text-purple-500 transition-colors"><Mail className="text-purple-500" /> support@dongleiq.com</div>
              <div className="flex items-center gap-4 hover:text-purple-500 transition-colors"><MessageSquare className="text-purple-500" /> 24/7 Live Chat Support</div>
            </div>
          </div>
          <form className="space-y-4">
            <input placeholder="Name" className={`w-full ${theme.inputBg} border ${theme.border} ${theme.text} p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-medium`} />
            <textarea placeholder="Message" rows={4} className={`w-full ${theme.inputBg} border ${theme.border} ${theme.text} p-4 rounded-2xl outline-none focus:border-purple-500 transition-all font-medium`} />
            <button className={`${theme.accent} w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all`}>Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({ icon, title, desc, theme }: any) {
  return (
    <div className={`${theme.card} border ${theme.border} p-8 rounded-[32px] hover:scale-[1.02] transition-all group relative overflow-hidden shadow-xl`}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-600/5 rounded-full group-hover:bg-purple-600/10 transition-colors" />
      <div className="text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-black uppercase mb-4 tracking-tight">{title}</h3>
      <p className={`${theme.textMuted} text-[11px] leading-relaxed font-medium`}>{desc}</p>
    </div>
  );
}

function StepItem({ number, icon, title, desc, theme }: any) {
  const cardColor = theme.card.includes('bg-white') ? '#fff' : '#121620';
  return (
    <div className="text-center group">
      <div className="w-20 h-20 rounded-3xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-500 mx-auto mb-8 relative transition-all group-hover:-translate-y-2">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
        <span
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-purple-600 text-white text-[10px] font-black flex items-center justify-center border-4 shadow-sm"
          style={{ borderColor: cardColor }}
        >
          {number}
        </span>
      </div>
      <h3 className="text-lg font-black uppercase mb-4 tracking-tight">{title}</h3>
      <p className={`${theme.textMuted} text-sm leading-relaxed px-4 font-medium`}>{desc}</p>
    </div>
  );
}

function AgentCard({ icon, label, theme }: any) {
  return (
    <div className={`${theme.card} border ${theme.border} p-8 rounded-3xl hover:border-purple-500/50 transition-all group flex flex-col items-center shadow-lg`}>
      <div className="text-purple-500 mb-4 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 40 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center opacity-80">{label}</span>
    </div>
  );
}

function FaqItem({ q, a, index, active, setActive, theme }: any) {
  const isOpen = active === index;
  return (
    <div className={`${theme.card} border ${theme.border} rounded-2xl overflow-hidden shadow-md transition-all`}>
      <button onClick={() => setActive(isOpen ? null : index)} className="w-full p-6 flex justify-between items-center text-left">
        <span className="text-sm font-black uppercase tracking-tight">{q}</span>
        {isOpen ? <ChevronUp size={18} className="text-purple-500" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {isOpen && <div className={`p-6 pt-0 text-sm ${theme.textMuted} leading-relaxed border-t ${theme.border} font-medium`}>{a}</div>}
    </div>
  );
}