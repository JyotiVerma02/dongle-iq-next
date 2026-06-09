"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  Cpu,
  FileCheck2,
  Fingerprint,
  GraduationCap,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
  UserCheck,
  Workflow,
  Zap,
} from "lucide-react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";

import LiveChat from "@/components/LiveChat";
import { useTheme } from "@/components/ThemeContext";
import { getThemePalette } from "@/lib/themePalette";

import { motion } from "framer-motion";
import SpotlightCard from "@/components/ui/SpotlightCard";
import MagneticButton from "@/components/ui/MagneticButton";
import ScrollReveal from "@/components/ui/ScrollReveal";
import Image from "next/image";

type FaqEntry = {
  question: string;
  answer: string;
};

type Feature = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Audience = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

const trustMetrics = [
  { value: "10 min", label: "Typical onboarding time" },
  { value: "24/7", label: "Support availability" },
  { value: "100%", label: "Paperless verification flow" },
  { value: "2048-bit", label: "Certificate-grade encryption" },
];

const valueProps: Feature[] = [
  {
    title: "Fast, guided issuance",
    description:
      "A streamlined onboarding path keeps every step clear, reducing drop-offs and helping agents complete applications with confidence.",
    icon: <Zap size={22} />,
  },
  {
    title: "Trusted compliance",
    description:
      "Government-aligned verification, secure document handling, and clear review checkpoints create a more credible experience for every applicant.",
    icon: <ShieldCheck size={22} />,
  },
  {
    title: "Support that converts",
    description:
      "Smart contact surfaces, visible assistance, and cleaner decision points make it easier for visitors to move from interest to action.",
    icon: <Headphones size={22} />,
  },
];

const productFeatures: Feature[] = [
  {
    title: "Aadhaar eKYC verification",
    description:
      "Identity checks feel faster and more reassuring with a step-by-step verification flow that reduces friction.",
    icon: <Fingerprint size={20} />,
  },
  {
    title: "Document-ready submissions",
    description:
      "Upload states, validation cues, and cleaner form hierarchy help users submit the right files the first time.",
    icon: <FileCheck2 size={20} />,
  },
  {
    title: "Clear application status",
    description:
      "Progress states and review markers make the journey transparent, which improves confidence and support efficiency.",
    icon: <Workflow size={20} />,
  },
  {
    title: "Conversion-focused support",
    description:
      "Contact and quote areas are positioned for real buying intent, with stronger trust signals and simpler follow-through.",
    icon: <MessageSquare size={20} />,
  },
];

const applicationSteps = [
  {
    step: "01",
    title: "Choose your service",
    description:
      "Select the DSC or IRCTC onboarding option that fits your business without sorting through clutter.",
  },
  {
    step: "02",
    title: "Verify securely",
    description:
      "Complete Aadhaar eKYC and upload supporting documents inside a guided, low-friction workflow.",
  },
  {
    step: "03",
    title: "Launch faster",
    description:
      "Move from approval to activation with clearer confirmations, next-step guidance, and live support access.",
  },
];

const audienceCards: Audience[] = [
  {
    title: "Self-employed professionals",
    description:
      "Add secure digital identity services without adding operational complexity.",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Retail service centers",
    description:
      "Turn walk-in demand into a higher-trust service offering with faster processing.",
    icon: <Store size={20} />,
  },
  {
    title: "Freelancers and consultants",
    description:
      "Offer onboarding help with a polished workflow clients can actually trust.",
    icon: <Sparkles size={20} />,
  },
  {
    title: "Students and new earners",
    description:
      "Start with a professional platform that makes learning, selling, and supporting easier.",
    icon: <GraduationCap size={20} />,
  },
  {
    title: "Retired professionals",
    description:
      "Stay active with a service model built around clarity, assistance, and steady digital demand.",
    icon: <UserCheck size={20} />,
  },
  {
    title: "Agency operators",
    description:
      "Standardize applications and deliver a stronger customer experience across every submission.",
    icon: <Cpu size={20} />,
  },
];

const faqs: FaqEntry[] = [
  {
    question: "What is a Digital Signature Certificate?",
    answer:
      "A Digital Signature Certificate is a secure digital credential used to verify identity and sign documents electronically.",
  },
  {
    question: "Why do agents need a DSC?",
    answer:
      "Agents use DSCs for secure filings, official submissions, e-tendering, and trusted digital workflows such as IRCTC-related onboarding.",
  },
  {
    question: "How long does issuance usually take?",
    answer:
      "For well-prepared applications, the guided process is designed to help users complete onboarding quickly, often within minutes.",
  },
  {
    question: "What documents are usually required?",
    answer:
      "Applicants typically need valid identity proof and address proof, along with any business-specific details required by the service type.",
  },
  {
    question: "Can certificates be renewed or reissued?",
    answer:
      "Yes. The platform can support renewals and reissuance workflows when a certificate expires or needs to be re-provisioned.",
  },
  {
    question: "Is support available during the application flow?",
    answer:
      "Yes. The experience is built to surface human support and clear next steps when users need help finishing verification or submission.",
  },
];

export default function DongleIQLanding() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getThemePalette(isDarkMode);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    email: "",
    requirements: "",
  });

  const handleQuoteFieldChange = (
    field: "name" | "email" | "requirements",
    value: string,
  ) => {
    setQuoteForm((current) => ({ ...current, [field]: value }));
  };

  const handleQuoteSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = quoteForm.name.trim();
    const email = quoteForm.email.trim();
    const requirements = quoteForm.requirements.trim();

    if (!name || !email || !requirements) {
      return;
    }

    const subject = encodeURIComponent(`Quote request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\nRequirements:\n${requirements}`,
    );

    window.location.href = `mailto:support@dongleiq.com?subject=${subject}&body=${body}`;
  };

  return (
    <main
      className="page-shell min-h-screen theme-transition"
      style={{ color: colors.text }}
    >
      <section id="hero" className="section hero-section-full-bleed">
        <div className="hero-shell-full-bleed">
          <div className="container-shell pt-4 sm:pt-5 lg:pt-7 ">
            <div className="hero-panel-inner">
              <div className="hero-copy-block flex flex-col justify-center">
                <div className="eyebrow-chip mb-6 self-start">
                  <BadgeCheck size={14} />
                  <span>
                    A Trusted onboarding platform for DSC & IRCTC agents
                  </span>
                </div>

                <h1 className="hero-title">
                  <span className="hero-title-line">
                    Secure digital identity,
                  </span>
                  <span className="hero-title-line text-accent-soft">
                    redesigned for{" "}
                  </span>
                  <span className="hero-title-line text-gradient-cool">
                    speed and trust
                  </span>
                </h1>

                <p className="hero-copy mt-6">
                  DongleIQ accelerates agent onboarding with a streamlined
                  application flow, enhanced verification UX, and a secure
                  platform.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    onClick={() => router.push("/register")}
                    className="button-primary group"
                  >
                    Start application
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>

                  <a href="#contact" className="button-secondary">
                    Request a custom quote
                    <ChevronRight size={16} />
                  </a>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  {[
                    "Fast onboarding",
                    "Licensed trust flow",
                    "Human support",
                  ].map((item) => (
                    <div key={item} className="inline-trust-pill">
                      <CheckCircle2 size={14} className="text-accent-strong" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hero-visual-block relative flex justify-center mt-8 lg:mt-0">
                <div className="relative w-full max-w-[1000px] lg:max-w-[1100px]">
                  <div className="hero-image-wrapper relative">
                    {/* Dark Image */}
                    <Image
                      src="/images/download.svg"
                      alt="DongleIQ Dashboard"
                      width={1200}
                      height={800}
                      priority
                      unoptimized
                      className="h-auto w-full object-contain"
                      style={{
                        display: isDarkMode ? "block" : "none",
                      }}
                    />

                    {/* Light Image */}
                    <Image
                      src="/images/download light.svg"
                      alt="DongleIQ Dashboard"
                      width={1200}
                      height={800}
                      priority
                      unoptimized
                      className="h-auto w-full object-contain"
                      style={{
                        display: !isDarkMode ? "block" : "none",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 lg:mt-10">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {trustMetrics &&
                  trustMetrics.map((item, index) => (
                    <div
                      key={item.label}
                      className="stat-surface reveal-up"
                      style={{ animationDelay: `${index * 90}ms` }}
                    >
                      <div className="stat-value text-accent-strong">
                        {item.value}
                      </div>
                      <div className="stat-label mt-1 font-semibold uppercase tracking-wide">
                        {item.label}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="whyus" className="section">
        <ScrollReveal className="container-shell">
          <SectionHeader
            label="Why teams choose DongleIQ"
            title={
              <>
                A sharper experience for{" "}
                <span className="text-gradient-brand">
                  trust, speed, and conversion
                </span>
              </>
            }
            description="The design is tuned to reduce friction, look more professional, and help visitors understand what to do next without hesitation."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {valueProps.map((item, index) => (
              <GlowingCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="section">
        <ScrollReveal className="container-shell">
          <div className="split-band ">
            <div className="flex items-center  justify-center h-full">
              <SectionHeader
                // align="center"
                label="Platform highlights"
                title={
                  <>
                    Every important interaction feels{" "}
                    <span className="text-gradient-cool">
                      cleaner and more intentional
                    </span>
                  </>
                }
                description="Better hierarchy, calmer surfaces, and stronger status cues make the product feel more premium while improving completion confidence."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {productFeatures.map((item, index) => (
                <GlowingCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  index={index}
                />
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section
        id="apply"
        className="section section-muted"
        style={{ backgroundColor: colors.panelStrong }}
      >
        <ScrollReveal className="container-shell">
          <SectionHeader
            label="How it works"
            title={
              <>
                A short path from{" "}
                <span className="text-gradient-brand">
                  application to activation
                </span>
              </>
            }
            description="The process is designed to look reassuring, move quickly, and avoid the messy handoff feeling common in older service portals."
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {applicationSteps.map((item, index) => (
              <GlowingCard
                key={item.step}
                icon={<span className="text-sm">{item.step}</span>}
                title={item.title}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section id="agents" className="section">
        <ScrollReveal className="container-shell">
          <SectionHeader
            label="Who it is for"
            title={
              <>
                Built for{" "}
                <span className="text-gradient-cool">real operators</span> not
                just generic traffic
              </>
            }
            description="The audience sections now speak more directly to the people most likely to apply, which strengthens trust and makes the site feel more specific."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {audienceCards.map((item, index) => (
              <GlowingCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section id="faqs" className="section">
        <ScrollReveal className="container-shell">
          <SectionHeader
            label="Common questions"
            title={
              <>
                Answers that{" "}
                <span className="text-gradient-brand">remove hesitation</span>
              </>
            }
            description="A cleaner FAQ layout helps users find clarity faster and keeps the page feeling tidy even as more content is added later."
          />

          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <FaqItem
                key={faq.question}
                faq={faq}
                isOpen={openFaq === index}
                onToggle={() =>
                  setOpenFaq((current) => (current === index ? null : index))
                }
              />
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section id="contact" className="section section-contact-compact">
        <ScrollReveal className="container-shell">
          <div className="contact-shell">
            <div className="contact-copy">
              <SectionHeader
                align="left"
                label="Contact and conversion"
                title={
                  <>
                    Give serious buyers a{" "}
                    <span className="text-gradient-cool">
                      cleaner way to reach you
                    </span>
                  </>
                }
                description="The contact area now works as a trust surface instead of an afterthought, with stronger hierarchy, clearer actions, and a more credible tone."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard
                  icon={<Phone size={18} />}
                  title="Phone"
                  text="+91 8564345678"
                  subtext="Mon to Fri, 9AM to 6PM IST"
                />
                <InfoCard
                  icon={<Mail size={18} />}
                  title="Email"
                  text="support@dongleiq.com"
                  subtext="Professional support for onboarding and renewal"
                />
                <InfoCard
                  icon={<MapPin size={18} />}
                  title="Office"
                  text="JMD Megapolis, Sohna Road"
                  subtext="Gurugram, Haryana 122018"
                />
                <InfoCard
                  icon={<Clock3 size={18} />}
                  title="Response"
                  text="Within 24 hours"
                  subtext="Priority handling for quote and setup requests"
                />
              </div>
            </div>

            <div className="quote-panel">
              <div className="quote-intro">
                <p className="eyebrow-text">Request a quote</p>
                <h3>Tell us what you need.</h3>
                <p>
                  For partner onboarding, renewals, or custom service support,
                  send a short request and the team can follow up with the right
                  next step.
                </p>
              </div>

              <form className="quote-form" onSubmit={handleQuoteSubmit}>
                <label className="field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={quoteForm.name}
                    onChange={(event) =>
                      handleQuoteFieldChange("name", event.target.value)
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </label>

                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={quoteForm.email}
                    onChange={(event) =>
                      handleQuoteFieldChange("email", event.target.value)
                    }
                    placeholder="name@company.com"
                    required
                  />
                </label>

                <label className="field field-full">
                  <span>Requirements</span>
                  <textarea
                    rows={4}
                    value={quoteForm.requirements}
                    onChange={(event) =>
                      handleQuoteFieldChange("requirements", event.target.value)
                    }
                    placeholder="Tell us about your onboarding, renewal, or partner support requirement."
                    required
                  />
                </label>

                <button type="submit" className="button-primary field-full">
                  Send request
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <footer className="site-footer">
        <div className="container-shell">
          <div className="footer-intro">
            <div>
              <p className="footer-kicker">DongleIQ in one line</p>
              <h2>Premium onboarding with trust-first design.</h2>
            </div>
            <p>
              Clean hierarchy, balanced color, and a smoother conversion flow
              keep the brand feeling confident in both light and dark mode.
            </p>
          </div>

          <div className="footer-grid">
            <div>
              <Link href="/" className="footer-brand">
                <div className="footer-brand-icon">
                  <Cpu size={18} />
                </div>
                <div>
                  <h3>
                    Dongle<span>IQ</span>
                  </h3>
                  <p>Secure digital onboarding</p>
                </div>
              </Link>

              <p className="footer-copy">
                Fast DSC issuance, cleaner onboarding, and a more professional
                digital trust experience for service partners across India.
              </p>

              <div className="footer-socials">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                  <FaLinkedinIn size={14} />
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <FaInstagram size={14} />
                </a>
              </div>
            </div>

            <FooterLinks
              title="Quick links"
              items={[
                { label: "Home", href: "/" },
                { label: "Why us", href: "/#whyus" },
                { label: "Apply", href: "/#apply" },
                { label: "Agents", href: "/#agents" },
                { label: "FAQs", href: "/#faqs" },
                { label: "Contact", href: "/#contact" },
              ]}
            />

            <FooterLinks
              title="Services"
              items={[
                { label: "Digital Signature Certificate", href: "/register" },
                { label: "IRCTC Agent Registration", href: "/register" },
                { label: "Aadhaar eKYC Verification", href: "/verify-aadhaar" },
                { label: "Renewal and reissue", href: "/login" },
              ]}
            />

            <div className="footer-contact">
              <h4>Get in touch</h4>
              <p>+91 8564345678</p>
              <p>support@dongleiq.com</p>
              <p>Gurugram, Haryana, India</p>
              <p>Mon to Fri, 9AM to 6PM</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 DongleIQ. All rights reserved.</p>
            <div>
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
              <a href="#">Cookies</a>
              <a href="#">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {!chatOpen && (
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Open live support chat"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-(--accent) text-white shadow-[0_16px_34px_-18px_var(--accent-shadow)] border border-white/10 hover:-translate-y-1 hover:brightness-110 transition-all duration-200"
        >
          <MessageSquare size={24} />
        </button>
      )}
      <LiveChat open={chatOpen} onClose={() => setChatOpen(false)} />
    </main>
  );
}

function SectionHeader({
  label,
  title,
  description,
  align = "center",
}: {
  label: string;
  title: React.ReactNode;
  description: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={`section-header ${align === "left" ? "section-header-left" : ""}`}
    >
      <p className="eyebrow-text">{label}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

const glowColors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
];

function GlowingCard({
  icon,
  title,
  description,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}) {
  const glow = glowColors[index % glowColors.length];

  return (
    <div
      className="group relative h-full min-h-[240px] rounded-[24px] bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] overflow-hidden transition-all duration-500 hover:border-slate-300 dark:hover:border-white/[0.15] hover:-translate-y-2 reveal-up"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent opacity-50"></div>
      <div
        className={`absolute -top-20 -right-20 w-80 h-80 rounded-full ${glow} opacity-[0.05] dark:opacity-[0.15] blur-[80px] group-hover:opacity-[0.1] dark:group-hover:opacity-25 transition-opacity duration-700`}
      ></div>
      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
        <div>
          <div className="mb-4 w-10 h-10 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center backdrop-blur-md group-hover:bg-slate-100 dark:group-hover:bg-white/10 transition-colors">
            <div className="text-slate-600 dark:text-slate-200 flex items-center justify-center font-bold">
              {icon}
            </div>
          </div>
          <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-slate-100 tracking-wide">
            {title}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
  subtext,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  subtext: string;
}) {
  return (
    <div className="info-card">
      <div className="info-card-icon">{icon}</div>
      <div>
        <p className="info-card-title">{title}</p>
        <p className="info-card-text">{text}</p>
        <p className="info-card-subtext">{subtext}</p>
      </div>
    </div>
  );
}

function FooterLinks({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="footer-links">
      <h4>{title}</h4>
      {items.map((item) => (
        <a key={item.label} href={item.href}>
          {item.label}
        </a>
      ))}
    </div>
  );
}

function PreviewRow({
  title,
  subtitle,
  status,
}: {
  title: string;
  subtitle: string;
  status: string;
}) {
  return (
    <div className="preview-row">
      <div className="preview-row-icon">
        <CheckCircle2 size={16} />
      </div>
      <div className="preview-row-copy">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      <div className="status-pill">{status}</div>
    </div>
  );
}

function MetricCard({
  value,
  label,
  caption,
}: {
  value: string;
  label: string;
  caption: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-value">
        {value} <span>{label}</span>
      </div>
      <p>{caption}</p>
    </div>
  );
}

function FaqItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FaqEntry;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`faq-card ${isOpen ? "faq-card-open" : ""}`}>
      <button type="button" className="faq-button" onClick={onToggle}>
        <span>{faq.question}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen ? (
        <div className="faq-content faq-content-open">
          <p>{faq.answer}</p>
        </div>
      ) : null}
    </div>
  );
}
