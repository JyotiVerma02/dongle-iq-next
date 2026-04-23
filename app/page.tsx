/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/context/ThemeContext";
import { getThemePalette } from "@/app/lib/themePalette";

import {
  Cpu,
  ArrowRight,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  UserPlus,
  MousePointerClick,
  Fingerprint,
  Download,
  Briefcase,
  UserCheck,
  Coffee,
  Store,
  GraduationCap,
  ShieldCheck,
  Zap,
  History,
  RefreshCw,
  Send,
  Clock,
  MapPin,
  Phone,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa6";

export default function DongleIQLanding() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { isDarkMode } = useTheme();

  const colors = getThemePalette(isDarkMode);

  const faqs = [
    {
      q: "What is a Digital Signature Certificate (DSC)?",
      a: "A Digital Signature Certificate is an electronic form of a signature that helps authenticate the identity of an individual or organization in digital communications.",
    },
    {
      q: "Why do I need a Digital Signature Certificate?",
      a: "You need a DSC to securely sign digital documents, file returns (Income Tax, GST), and participate in e-tendering.",
    },
    {
      q: "Who issues a Digital Signature Certificate?",
      a: "DSCs are issued by licensed Certifying Authorities (CAs) authorized by the CCA, Government of India.",
    },
    {
      q: "What are the types of Digital Signature Certificates?",
      a: "Main types include Class 3 (e-tendering/high security) and DGFT DSC (foreign trade).",
    },
    {
      q: "How long is a Digital Signature Certificate valid?",
      a: "A DSC is usually issued with a validity of 1, 2, or 3 years.",
    },
    {
      q: "What documents are required to apply for a DSC?",
      a: "Identity Proof (PAN, Aadhaar) and Address Proof are typically required.",
    },
    {
      q: "How can I use a Digital Signature Certificate?",
      a: "It is used via a secure USB Token inserted into your computer's USB port.",
    },
    {
      q: "Can a Digital Signature Certificate be revoked?",
      a: "Yes, if the private key is compromised or the user requests revocation.",
    },
  ];

  const highlights = [
    { value: "10 min", label: "Average onboarding" },
    { value: "24/7", label: "Human support" },
    { value: "100%", label: "Paperless flow" },
  ];

  return (
    <div
      className="theme-transition min-h-screen font-sans antialiased"
      style={{ color: colors.text }}
    >
      {/* --- HERO --- */}
      <section className="hero-grid relative overflow-hidden px-6 pb-28 pt-36 md:pb-32 md:pt-40">
        <div
          className="hero-glow left-0 top-20 h-56 w-56"
          style={{ backgroundColor: colors.accent }}
        />
        <div
          className="hero-glow right-10 top-32 h-72 w-72"
          style={{ backgroundColor: "var(--accent-secondary)" }}
        />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.82fr)] lg:gap-20">
          <div className="max-w-2xl">
            <div
              className="mb-6 inline-flex rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em]"
              style={{
                borderColor: colors.borderSoft,
                backgroundColor: colors.card,
                color: colors.accent,
              }}
            >
              Trusted digital onboarding
            </div>
            <h1 className="mb-6 text-4xl font-black uppercase leading-[0.96] tracking-tight md:text-6xl xl:text-[4.4rem]">
              Faster digital <br />
              <span style={{ color: colors.accent }}>trust for agents.</span>
            </h1>
            <p
              className="mb-10 max-w-lg text-[15px] font-medium leading-8 md:text-base"
              style={{ color: colors.muted }}
            >
              Launch your DSC and IRCTC agent ID workflow with a guided,
              paperless application experience built for certified agents who
              need fast digital signature issuance, secure verification, and
              IRCTC-ready onboarding.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={() => router.push("/signup")}
                className="theme-primary-btn hover-btn flex items-center justify-center gap-3 rounded-md px-5 py-3.5 text-sm font-bold uppercase text-white sm:w-fit"
                style={{
                  backgroundColor: "#2563eb",
                  boxShadow: `0 12px 24px rgba(30, 64, 175, 0.18)`,
                }}
              >
                Start Application <ArrowRight size={18} />
              </button>
             
            </div>
            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {highlights.map((item, index) => (
                <div
                  key={item.label}
                  className={`rounded-xl border px-5 py-4 ${index % 2 === 0 ? "float-slow" : "float-delay"}`}
                  style={{
                    backgroundColor: colors.card,
                    borderColor: colors.borderSoft,
                  }}
                >
                  <p
                    className="text-2xl font-black uppercase"
                    style={{
                      color: index === 1 ? colors.accentLight : colors.accent,
                    }}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: colors.muted }}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0 lg:pl-4">
            <div
              className="shine-border relative overflow-hidden rounded-2xl border p-5 shadow-xl md:p-6"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.borderSoft,
              }}
            >
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  background:
                    "radial-gradient(circle at top right, var(--accent-subtle), transparent 30%), radial-gradient(circle at bottom left, var(--accent-faint), transparent 38%)",
                }}
              />
              <div className="relative z-10 space-y-4">
                <div className="max-w-sm">
                    <p
                      className="text-[9px] font-black uppercase tracking-[0.28em]"
                      style={{ color: colors.muted }}
                    >
                      Smart Approval Flow
                    </p>
                    <h3 className="mt-2 text-xl font-black uppercase tracking-tight md:text-2xl">
                      Apply, verify, submit.
                    </h3>
                    <p
                      className="mt-3 text-[13px] font-semibold leading-6"
                      style={{ color: colors.muted }}
                    >
                      A cleaner onboarding card with fast checkpoints, clearer
                      status cues, and a more confident application journey.
                    </p>
                </div>

                {[
                  {
                    title: "Profile ready",
                    note: "Email and identity fields auto-guided for clean submission.",
                  },
                  {
                    title: "Verification faster",
                    note: "OTP and Aadhaar flow stay visible, clear, and responsive.",
                  },
                  {
                    title: "Document secure",
                    note: "Drag, drop, preview, and confirm JPG, PNG, or PDF in one flow.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className="rounded-xl border p-3.5 md:p-4"
                    style={{
                      backgroundColor: colors.panelStrong,
                      borderColor: colors.borderSoft,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black text-white"
                        style={{
                          backgroundColor:"#2563eb",
                        }}
                      >
                        0{index + 1}
                      </div>
                      <div className="pt-0.5">
                        <h4 className="text-[13px] font-black uppercase tracking-tight">
                          {item.title}
                        </h4>
                        <p
                          className="mt-1.5 text-[11px] font-semibold leading-5"
                          style={{ color: colors.muted }}
                        >
                          {item.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHY CHOOSE US --- */}
      <section id="whyus" className="py-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 ">
              Why Choose <span style={{ color: colors.accent }}>Us?</span>
            </h2>
            <div
              className="h-1.5 w-20 mx-auto rounded-full shadow-lg"
              style={{ backgroundColor: colors.accent }}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              colors={colors}
              icon={<Zap size={32} />}
              title="Fast & Paperless"
              desc="Apply for your Digital Signature Certificate online and receive it within minutes."
            />
            <FeatureCard
              colors={colors}
              icon={<History size={32} />}
              title="Government Licensed"
              desc="We are a certified authority trusted by the government since 2008."
            />
            <FeatureCard
              colors={colors}
              icon={<Fingerprint size={32} />}
              title="Instant Approval"
              desc="100% paperless verification using Aadhaar eKYC for quick issuance."
            />
            <FeatureCard
              colors={colors}
              icon={<MessageSquare size={32} />}
              title="24/7 Support"
              desc="Our team responds in less than 5 minutes to help with any queries."
            />
            <FeatureCard
              colors={colors}
              icon={<ShieldCheck size={32} />}
              title="Global Security"
              desc="2048-bit encryption ensures your DSC is secure and compliant."
            />
            <FeatureCard
              colors={colors}
              icon={<RefreshCw size={32} />}
              title="Unlimited Re-issuance"
              desc="Need a re-issuance? It’s unlimited and hassle-free for partners."
            />
          </div>
        </div>
      </section>

      {/* --- HOW TO APPLY --- */}
      <section
        id="apply"
        className="py-24 px-6 border-y"
        style={{
          borderColor: colors.borderSoft,
          backgroundColor: colors.panel,
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase mb-20 tracking-tighter ">
            How To <span style={{ color: colors.accent }}>Apply?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <StepItem
              number="01"
              colors={colors}
              icon={<MousePointerClick />}
              title="Apply Online"
              desc="Choose your DSC type and start your application digitally."
            />
            <StepItem
              number="02"
              colors={colors}
              icon={<UserPlus />}
              title="Verify Identity"
              desc="Complete the secure Aadhaar eKYC process in under 2 minutes."
            />
            <StepItem
              number="03"
              colors={colors}
              icon={<Download />}
              title="Download DSC"
              desc="Install your Digital Signature Certificate instantly after verification."
            />
          </div>
        </div>
      </section>

      {/* --- AGENTS SECTION --- */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase mb-16 tracking-tighter">
            Who can become an{" "}
            <span style={{ color: colors.accent }}>Agent?</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-8  ">
            {/* Row 1 - 3 cards */}
            <div className="md:col-span-2">
              <AgentCard
                colors={colors}
                icon={<Briefcase />}
                label="Self-Employed"
              />
            </div>

            <div className="md:col-span-2">
              <AgentCard
                colors={colors}
                icon={<Coffee />}
                label="Freelancers"
              />
            </div>

            <div className="md:col-span-2">
              <AgentCard colors={colors} icon={<UserCheck />} label="Retired" />
            </div>

            {/* Row 2 - 2 cards */}
            <div className="md:col-span-6 flex justify-center gap-8">
              <div className="w-full sm:w-[45%] md:w-[28%]">
                <AgentCard colors={colors} icon={<Store />} label="Retailer" />
              </div>

              <div className="w-full sm:w-[45%] md:w-[28%]">
                <AgentCard
                  colors={colors}
                  icon={<GraduationCap />}
                  label="Student"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQS --- */}
      <section
        id="faqs"
        className="py-24 px-6 border-t"
        style={{ borderColor: colors.borderSoft }}
      >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12 uppercase tracking-tighter ">
            Common <span style={{ color: colors.accent }}>Queries</span>
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                colors={colors}
                index={i}
                active={openFaq}
                setActive={setOpenFaq}
                q={faq.q}
                a={faq.a}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- CONTACT --- */}
      <section id="contact" className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          {/* --- Header Section --- */}
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6">
              Get In <span style={{ color: colors.accent }}>Touch.</span>
            </h2>
            <p
              style={{ color: colors.muted }}
              className="max-w-2xl mx-auto font-bold text-lg leading-relaxed"
            >
              Our support team is here to help you navigate your digital
              identity needs.
            </p>
          </div>

          {/* --- Top Info Cards (Similar to video layout) --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: <Phone size={24} />,
                title: "Phone",
                d1: "+91 8564345678",
                d2: "Mon-Fri, 9AM-6PM IST",
              },
              {
                icon: <Mail size={24} />,
                title: "Email",
                d1: "support@dongleiq.com",
                d2: "24/7 Professional Support",
              },
              {
                icon: <MapPin size={24} />,
                title: "Location",
                d1: "JMD Megapolis, Sohna Road",
                d2: "Gurugram, Haryana 122018",
              },
              {
                icon: <Clock size={24} />,
                title: "Response Time",
                d1: "Within 24 Hours",
                d2: "Guaranteed feedback",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="hover-card p-6 rounded-lg border group transition-all"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <div
                  className="mb-6 group-hover:scale-110 transition-transform"
                  style={{ color: colors.accent }}
                >
                  {card.icon}
                </div>
                <h3
                  className="text-xs font-black uppercase tracking-widest mb-3"
                  style={{ color: colors.muted }}
                >
                  {card.title}
                </h3>
                <p className="text-sm font-black mb-1">{card.d1}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">
                  {card.d2}
                </p>
              </div>
            ))}
          </div>

          {/* --- Main Action Section (Form + Sidebar) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form Area */}
            <div
              className="lg:col-span-2 p-6 md:p-8 rounded-lg border relative overflow-hidden shadow-lg"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
              }}
            >
              {/* Subtle Accent Line */}
              <div
                className="absolute top-0 left-0 w-full h-1.5 opacity-30"
                style={{
                  background: `linear-gradient(to right, transparent, ${colors.accent}, transparent)`,
                }}
              />

              <h3 className="text-3xl font-black uppercase mb-10 tracking-tight">
                Request a{" "}
                <span style={{ color: colors.accent }}>Custom Quote</span>
              </h3>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label
                    className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                    style={{ color: colors.muted }}
                  >
                    Full Name
                  </label>
                  <input
                    placeholder="Enter your name"
                    className="w-full bg-transparent border border-white/10 p-4 rounded-lg outline-none focus:border-purple-500 transition-all font-bold text-sm"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <label
                    className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                    style={{ color: colors.muted }}
                  >
                    Email Address
                  </label>
                  <input
                    placeholder="john@company.com"
                    className="w-full bg-transparent border border-white/10 p-4 rounded-lg outline-none focus:border-purple-500 transition-all font-bold text-sm"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label
                    className="text-[10px] font-black uppercase tracking-[0.2em] ml-2"
                    style={{ color: colors.muted }}
                  >
                    Message / Requirements
                  </label>
                  <textarea
                    placeholder="Tell us how you plan to use the Dongle IQ portal for your agency... or contact us on WhatsApp for quick quotes."
                    rows={4}
                    className="w-full bg-transparent border border-white/10 p-4 rounded-lg outline-none focus:border-purple-500 transition-all font-bold text-sm resize-none"
                    style={{
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    }}
                  />
                </div>
                <button
                  className="md:col-span-2 py-4 rounded-lg text-[12px] font-semibold uppercase tracking-[0.25em] text-white shadow-lg hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{
                    backgroundColor: "#111827",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  Send Message <Send size={16} />
                </button>
              </form>
            </div>

            {/* Sidebar Links (Similar to CoderLala sidebar) */}
            <div className="space-y-8">
              <div
                className="hover-card p-6 rounded-lg border relative group transition-all"
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }}
              >
                <h3 className="text-xl font-black uppercase mb-8 tracking-tighter">
                  Why <span style={{ color: colors.accent }}>Contact Us?</span>
                </h3>
                <ul className="space-y-6">
                  {[
                    { t: "Project Inquiry", d: "Discuss new partner IDs" },
                    { t: "Consultation", d: "Free 15-min strategy session" },
                    { t: "Support", d: "Technical DSC assistance" },
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-4 group/item cursor-pointer"
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                        style={{
                          backgroundColor: `${colors.accent}15`,
                          color: colors.accent,
                        }}
                      >
                        <ChevronRight
                          size={18}
                          className="group-hover/item:translate-x-1 transition-transform"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-tight">
                          {item.t}
                        </h4>
                        <p className="text-[10px] font-bold opacity-40 uppercase">
                          {item.d}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Branding/Support Card */}
              <div
                className="p-6 rounded-lg border border-blue-500/20"
                style={{ backgroundColor: `${colors.accent}14` }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-6"
                  style={{ backgroundColor: colors.accent }}
                >
                  <MessageSquare className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-black uppercase mb-4 tracking-tighter">
                  AI Live Chat
                </h3>
                <p className="text-xs font-bold leading-relaxed opacity-60">
                  For urgent matters or instant assistance with registration,
                  chat directly with our AI support assistant.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 Replace your footer classes with this smaller + thinner typography version */}

<footer
  className="border-t px-6 md:px-10 pt-14 pb-5"
  style={{
    borderColor: colors.borderSoft,
    backgroundColor: colors.card,
  }}
>
  <div className="mx-auto max-w-7xl">
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
      
      {/* Brand */}
      <div>
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md"
            style={{ background: colors.accent }}
          >
            <Cpu size={20} />
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Dongle<span style={{ color: colors.accent }}>IQ</span>
            </h3>

            <p
              className="text-[10px] font-medium uppercase tracking-[0.14em]"
              style={{ color: colors.muted }}
            >
              Secure Digital Identity
            </p>
          </div>
        </div>

        <p
          className="mt-5 max-w-xs text-[13px] leading-6 font-normal"
          style={{ color: colors.muted }}
        >
          Fast DSC issuance, IRCTC onboarding and secure paperless verification
          platform for agents across India.
        </p>

        <div className="mt-8">
          <h4 className="text-lg font-medium mb-4">Follow Us</h4>

          <div className="flex gap-3">
            {[
              {
                icon: <FaLinkedinIn size={15} />,
                href: "https://linkedin.com",
                color: "#0A66C2",
              },
              {
                icon: <FaInstagram size={15} />,
                href: "https://instagram.com",
                color: "#E1306C",
              },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-md border hover:-translate-y-1 transition-all"
                style={{
                  borderColor: colors.borderSoft,
                  backgroundColor: colors.panelStrong,
                  color: item.color,
                }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Replace Quick Links + Services section with clickable links */}

{[
  {
    title: "Quick Links",
    items: [
      { label: "Home", href: "/" },
      { label: "Why Us", href: "/#whyus" },
      { label: "Apply", href: "/#apply" },
      { label: "Agents", href: "/#agents" },
      { label: "FAQs", href: "/#faqs" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Our Services",
    items: [
      { label: "Digital Signature Certificate", href: "/services/dsc" },
      { label: "IRCTC Agent Registration", href: "/services/irctc" },
      { label: "Aadhaar eKYC Verification", href: "/services/ekyc" },
      { label: "Renewal & Reissue", href: "/services/renewal" },
      { label: "Partner Support", href: "/services/support" },
      { label: "Business Solutions", href: "/services/business" },
    ],
  },
].map((section, idx) => (
  <div key={idx}>
    <h4 className="text-xl font-medium mb-6">{section.title}</h4>

    <div className="space-y-4 text-[14px] font-normal">
      {section.items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          className="block transition-all hover:translate-x-1 hover:opacity-100"
          style={{ color: colors.muted }}
        >
          {item.label}
        </a>
      ))}
    </div>
  </div>
))}

      {/* Contact */}
      <div>
        <h4 className="text-xl font-medium mb-6">Get in Touch</h4>

        <div className="space-y-6 text-[14px]">
          <div className="flex gap-3">
            <Phone size={18} style={{ color: colors.accent }} />
            <div>
              <p className="font-medium">Phone</p>
              <p style={{ color: colors.muted }}>+91 8564345678</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Mail size={18} style={{ color: colors.accent }} />
            <div>
              <p className="font-medium">Email</p>
              <p style={{ color: colors.muted }}>support@dongleiq.com</p>
            </div>
          </div>

          <div>
            <p className="font-medium mb-1">Address</p>
            <p style={{ color: colors.muted }}>Gurugram, Haryana, India</p>
          </div>

          <div>
            <p className="font-medium mb-1">Office Hours</p>
            <p style={{ color: colors.muted }}>Mon - Fri: 9AM - 6PM</p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom */}
    <div
      className="mt-12 border-t pt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      style={{ borderColor: colors.borderSoft }}
    >
      <p className="text-[12px]" style={{ color: colors.muted }}>
        © 2026 DongleIQ. All rights reserved.
      </p>

      <div className="flex flex-wrap gap-5 text-[12px]">
        {["Privacy", "Terms", "Cookies", "Sitemap"].map((item) => (
          <a
            key={item}
            href="#"
            className="transition hover:opacity-80"
            style={{ color: colors.muted }}
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  </div>
</footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FeatureCard({ icon, title, desc, colors }: any) {
  return (
    <div
      className="hover-card p-6 rounded-lg border transition-all group relative overflow-hidden shadow-xl"
      style={{
        backgroundColor: colors.card,
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="absolute -right-4 -top-4 w-24 h-24 rounded-full transition-colors opacity-10"
        style={{ backgroundColor: colors.accent }}
      />
      <div
        className="mb-6 group-hover:scale-110 transition-transform duration-300"
        style={{ color: colors.accent }}
      >
        {icon}
      </div>
      <h3 className="text-lg font-black uppercase mb-4 tracking-tight ">
        {title}
      </h3>
      <p
        className="text-[11px] leading-relaxed font-bold"
        style={{ color: colors.muted }}
      >
        {desc}
      </p>
    </div>
  );
}

function StepItem({ number, icon, title, desc, colors }: any) {
  return (
    <div className="text-center group">
      <div
        className="w-20 h-20 rounded-lg border flex items-center justify-center mx-auto mb-8 relative transition-all group-hover:-translate-y-2 shadow-lg"
        style={{
          backgroundColor: `${colors.accent}1A`,
          borderColor: `${colors.accent}33`,
          color: colors.accent,
        }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 32 })}
        <span
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full text-white text-[10px] font-black flex items-center justify-center border-4 shadow-sm"
          style={{
            backgroundColor: colors.accent,
            borderColor: colors.shellAlt,
          }}
        >
          {number}
        </span>
      </div>
      <h3 className="text-lg font-black uppercase mb-4 tracking-tight ">
        {title}
      </h3>
      <p
        className="text-sm leading-relaxed px-4 font-bold"
        style={{ color: colors.muted }}
      >
        {desc}
      </p>
    </div>
  );
}

function AgentCard({ icon, label, colors }: any) {
  return (
    <div
      className="hover-card p-6 rounded-lg border transition-all group flex flex-col items-center shadow-lg"
      style={{
        backgroundColor: colors.card,
        borderColor: "rgba(255,255,255,0.05)",
      }}
    >
      <div
        className="mb-4 group-hover:scale-110 transition-transform"
        style={{ color: colors.accent }}
      >
        {React.cloneElement(icon as React.ReactElement<any>, { size: 40 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center opacity-80">
        {label}
      </span>
    </div>
  );
}

function FaqItem({ q, a, index, active, setActive, colors }: any) {
  const isOpen = active === index;
  return (
    <div
      className="rounded-lg overflow-hidden shadow-md transition-all border"
      style={{
        backgroundColor: colors.card,
        borderColor: isOpen ? colors.accent : "rgba(255,255,255,0.05)",
      }}
    >
      <button
        onClick={() => setActive(isOpen ? null : index)}
        className="w-full p-6 flex justify-between items-center text-left"
      >
        <span className="text-sm font-black uppercase tracking-tight ">
          {q}
        </span>
        {isOpen ? (
          <ChevronUp size={18} style={{ color: colors.accent }} />
        ) : (
          <ChevronDown size={18} style={{ color: colors.muted }} />
        )}
      </button>
      {isOpen && (
        <div
          className="p-6 pt-0 text-sm leading-relaxed border-t font-bold"
          style={{ color: colors.muted, borderColor: "rgba(255,255,255,0.05)" }}
        >
          {a}
        </div>
      )}
    </div>
  );
}
