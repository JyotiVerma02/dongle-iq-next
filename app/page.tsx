/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import yourPng from '@/public/Device-Macbook-Pro.png'; // Or use a string path
import {
  Cpu, ArrowRight, ShieldCheck, Zap,
  Mail, MessageSquare, ChevronDown, ChevronUp, UserPlus, LogIn
} from "lucide-react";

export default function DongleIQLanding() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const theme = {
    bg: "bg-[#080b12]",
    card: "bg-[#121620]",
    border: "border-[#1e2330]",
    accent: "bg-purple-600",
    textMuted: "text-slate-400"
  };

  const navLinks = ["Hero", "About", "Services", "FAQs", "Contact"];

  return (
    <div className={`min-h-screen ${theme.bg} text-white font-sans scroll-smooth`}>
      {/* --- HEADER / MENU --- */}
      <nav className={`fixed top-0 w-full z-50 p-6 ${theme.bg}/80 backdrop-blur-md border-b ${theme.border}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${theme.accent} rounded-lg flex items-center justify-center`}>
              <Cpu size={18} className="text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase">Dongle<span className="text-purple-500">IQ</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="hover:text-purple-500 transition-colors">
                {link}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/login")}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter border ${theme.border} hover:bg-white/5 transition-all flex items-center gap-2`}
            >
              <LogIn size={14} className="text-purple-500" />
              Login
            </button>
            <button
              onClick={() => router.push("/signup")}
              className={`${theme.accent} px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tighter hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20 flex items-center gap-2`}
            >
              <UserPlus size={14} />
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section id="hero" className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-6">
              Next-Gen DSC Infrastructure
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Digital <span className="text-white/20 italic">ID</span> <br /> Simplified.
            </h1>
            <p className={`${theme.textMuted} text-lg mb-10 max-w-md`}>
              The premium SaaS platform for managing Dongle-based Agent IDs and IRCTC Digital Signature Certificates.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/signup")}
                className={`${theme.accent} px-8 py-4 rounded-2xl text-sm font-black uppercase flex items-center gap-2`}
              >
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className={`h-100 bg-transparent! relative flex items-center justify-center`}>
            {/* 1. The Image Component */}
            <Image
              src={yourPng}
              alt="Dashboard Preview"
              fill
              className="object-cover"
              priority // Add this if the image is "above the fold"
            />

            {/* 2. The Gradient Overlay (stays on top of the image) */}
            <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 to-transparent pointer-events-none" />

            {/* ShieldCheck icon is now removed */}
          </div>
        </div>
      </section>

      {/* --- ABOUT --- */}
      <section id="about" className="py-24 px-6 bg-[#0a0e17]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Built for <span className="text-purple-500">Security</span></h2>
          <p className={`${theme.textMuted} text-lg leading-relaxed`}>
            Dongle IQ is a web platform specifically designed for agent ID USB registrations. We bridge the gap between complex government compliance and user-friendly digital dashboards, ensuring your IRCTC DSC workflow is seamless and verified.
          </p>
        </div>
      </section>

      {/* --- SERVICES --- */}
      <section id="services" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              theme={theme}
              title="IRCTC Registration"
              desc="Streamlined workflow for Digital Signature Certificate registration."
              icon={<Zap size={24} />}
            />
            <ServiceCard
              theme={theme}
              title="Dongle Management"
              desc="Vault system for tracking dongle-based Agent ID USBs across your team."
              icon={<Cpu size={24} />}
            />
            <ServiceCard
              theme={theme}
              title="eKYC Verification"
              desc="Integrated Aadhaar and PAN verification system for professional dashboards."
              icon={<ShieldCheck size={24} />}
            />
          </div>
        </div>
      </section>

      {/* --- FAQS --- */}
      <section id="faqs" className="py-24 px-6 bg-[#0a0e17]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-12 text-center">Common Queries</h2>
          <div className="space-y-4">
            <FaqItem
              theme={theme}
              index={0}
              active={openFaq}
              setActive={setOpenFaq}
              q="What is a Dongle Agent ID?"
              a="It is a secure USB-based hardware token used to authenticate Agent identities for government portals like IRCTC."
            />
            <FaqItem
              theme={theme}
              index={1}
              active={openFaq}
              setActive={setOpenFaq}
              q="Is PAN verification mandatory?"
              a="Yes, our system implements integrated PAN and Aadhaar logic to ensure compliance."
            />
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className="py-24 px-6">
        <div className={`max-w-5xl mx-auto ${theme.card} border ${theme.border} rounded-[40px] p-12 grid grid-cols-1 md:grid-cols-2 gap-12`}>
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Get in <span className="text-purple-500">Touch</span></h2>
            <p className={theme.textMuted + " mb-8"}>Need help with your DSC registration? Our Gurugram-based support team is here.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm font-bold"><Mail size={18} className="text-purple-500" /> support@dongleiq.com</div>
              <div className="flex items-center gap-4 text-sm font-bold"><MessageSquare size={18} className="text-purple-500" /> Live Chat Available</div>
            </div>
          </div>
          <form className="space-y-4">
            <input placeholder="Full Name" className={`w-full ${theme.bg} border ${theme.border} p-4 rounded-xl text-sm focus:border-purple-500 outline-none`} />
            <textarea placeholder="How can we help?" rows={4} className={`w-full ${theme.bg} border ${theme.border} p-4 rounded-xl text-sm focus:border-purple-500 outline-none`} />
            <button className={`${theme.accent} w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest`}>Send Message</button>
          </form>
        </div>
      </section>
    </div>
  );
}


function ServiceCard({ title, desc, icon, theme }: any) {
  return (
    <div className={`${theme.card} border ${theme.border} p-10 rounded-4xl hover:border-purple-500/50 transition-all group`}>
      <div className="text-purple-500 mb-6 group-hover:scale-110 transition-transform">{icon}</div>
      <h4 className="text-xl font-black uppercase tracking-tighter mb-4">{title}</h4>
      <p className={`${theme.textMuted} text-sm leading-relaxed`}>{desc}</p>
    </div>
  );
}

function FaqItem({ q, a, index, active, setActive, theme }: any) {
  const isOpen = active === index;
  return (
    <div className={`${theme.card} border ${theme.border} rounded-2xl overflow-hidden`}>
      <button onClick={() => setActive(isOpen ? null : index)} className="w-full p-6 flex justify-between items-center text-left">
        <span className="text-sm font-bold uppercase tracking-tight">{q}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <div className={`p-6 pt-0 text-sm ${theme.textMuted} leading-relaxed border-t ${theme.border} bg-white/5`}>{a}</div>}
    </div>
  );
}