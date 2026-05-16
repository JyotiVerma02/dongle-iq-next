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
import { getThemePalette } from "@/app/lib/themePalette";

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
    description: "Add secure digital identity services without adding operational complexity.",
    icon: <Briefcase size={20} />,
  },
  {
    title: "Retail service centers",
    description: "Turn walk-in demand into a higher-trust service offering with faster processing.",
    icon: <Store size={20} />,
  },
  {
    title: "Freelancers and consultants",
    description: "Offer onboarding help with a polished workflow clients can actually trust.",
    icon: <Sparkles size={20} />,
  },
  {
    title: "Students and new earners",
    description: "Start with a professional platform that makes learning, selling, and supporting easier.",
    icon: <GraduationCap size={20} />,
  },
  {
    title: "Retired professionals",
    description: "Stay active with a service model built around clarity, assistance, and steady digital demand.",
    icon: <UserCheck size={20} />,
  },
  {
    title: "Agency operators",
    description: "Standardize applications and deliver a stronger customer experience across every submission.",
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
      className="page-shell min-h-screen"
      style={{ color: colors.text }}
    >
      <section className="section hero-section hero-section-full-bleed">
        <div className="hero-shell hero-shell-full-bleed px-5 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-9">
          <div className="container-shell hero-panel-inner">
            <div className="relative z-10 max-w-2xl">
              <div className="eyebrow-chip mb-6">
                <BadgeCheck size={14} />
                Trusted onboarding for DSC and IRCTC agents
              </div>

              <h1 className="hero-title max-w-3xl">
                Secure digital identity, redesigned for{" "}
                <span className="text-gradient-brand">speed and trust</span>.
              </h1>

              <p className="hero-copy mt-6 max-w-xl">
                DongleIQ helps agents launch faster with a cleaner application
                flow, sharper verification UX, and a modern platform that feels
                credible from the first click.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  onClick={() => router.push("/signup")}
                  className="button-primary"
                >
                  Start application
                  <ArrowRight size={18} />
                </button>

                <a href="#contact" className="button-secondary">
                  Request a custom quote
                  <ChevronRight size={18} />
                </a>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 text-sm">
                {[
                  "Fast onboarding",
                  "Licensed trust flow",
                  "Human support",
                ].map((item) => (
                  <div key={item} className="inline-trust-pill">
                    <CheckCircle2 size={16} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="dashboard-preview">
                <div className="dashboard-topbar">
                  <div>
                    <p className="dashboard-kicker">Application overview</p>
                    <h2 className="dashboard-heading">Approval flow</h2>
                  </div>
                  <div className="status-pill success">Ready to submit</div>
                </div>

                <div className="dashboard-stack">
                  <PreviewRow
                    title="Profile details"
                    subtitle="Email, applicant details, service selection"
                    status="Completed"
                  />
                  <PreviewRow
                    title="Identity verification"
                    subtitle="Aadhaar eKYC and OTP confirmation"
                    status="In review"
                  />
                  <PreviewRow
                    title="Document validation"
                    subtitle="Files checked for compliance and clarity"
                    status="Secure"
                  />
                </div>

                <div className="dashboard-metrics">
                  <MetricCard
                    value="3"
                    label="steps"
                    caption="clear progress states"
                  />
                  <MetricCard
                    value="5 min"
                    label="support"
                    caption="average first response"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>

        <div className="container-shell">
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {trustMetrics.map((item, index) => (
              <div
                key={item.label}
                className="stat-surface reveal-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="stat-value">{item.value}</div>
                <div className="stat-label">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="whyus" className="section">
        <div className="container-shell">
          <SectionHeader
            label="Why teams choose DongleIQ"
            title={
              <>
                A sharper experience for{" "}
                <span className="text-gradient-brand">
                  trust, speed, and conversion
                </span>
                .
              </>
            }
            description="The design is tuned to reduce friction, look more professional, and help visitors understand what to do next without hesitation."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {valueProps.map((item, index) => (
              <FeatureCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                colors={colors}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-shell">
          <div className="split-band ">
            <div className="flex items-center  justify-center h-full" >
              <SectionHeader
                // align="center"
                label="Platform highlights"
                title={
                  <>
                    Every important interaction feels{" "}
                    <span className="text-gradient-cool">
                      cleaner and more intentional
                    </span>
                    .
                  </>
                }
                description="Better hierarchy, calmer surfaces, and stronger status cues make the product feel more premium while improving completion confidence."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {productFeatures.map((item, index) => (
                <div
                  key={item.title}
                  className="feature-tile reveal-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="feature-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="apply"
        className="section section-muted"
        style={{ backgroundColor: colors.panelStrong }}
      >
        <div className="container-shell">
          <SectionHeader
            label="How it works"
            title={
              <>
                A short path from{" "}
                <span className="text-gradient-brand">
                  application to activation
                </span>
                .
              </>
            }
            description="The process is designed to look reassuring, move quickly, and avoid the messy handoff feeling common in older service portals."
          />

          <div className="grid gap-5 lg:grid-cols-3">
            {applicationSteps.map((item, index) => (
              <div
                key={item.step}
                className="process-card reveal-up"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                <div className="process-number">{item.step}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="agents" className="section">
        <div className="container-shell">
          <SectionHeader
            label="Who it is for"
            title={
              <>
                Built for{" "}
                <span className="text-gradient-cool">
                  real operators
                </span>
                , not just generic traffic.
              </>
            }
            description="The audience sections now speak more directly to the people most likely to apply, which strengthens trust and makes the site feel more specific."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {audienceCards.map((item, index) => (
              <AudienceCard
                key={item.title}
                icon={item.icon}
                title={item.title}
                description={item.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="section">
        <div className="container-shell">
          <SectionHeader
            label="Common questions"
            title={
              <>
                Answers that{" "}
                <span className="text-gradient-brand">remove hesitation</span>.
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
        </div>
      </section>

      <section id="contact" className="section">
        <div className="container-shell">
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
                    .
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
                    rows={5}
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

              <button
                type="button"
                className="support-note w-full text-left"
                onClick={() => setChatOpen(true)}
                aria-label="Open live support chat"
              >
                <div className="support-badge">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h4>Need instant guidance?</h4>
                  <p>
                    Use live chat or reach the support team directly for quicker
                    application assistance.
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container-shell">
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
                <a href="https://instagram.com" target="_blank" rel="noreferrer">
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
                { label: "Digital Signature Certificate", href: "/signup" },
                { label: "IRCTC Agent Registration", href: "/signup" },
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
    <div className={`section-header ${align === "left" ? "section-header-left" : ""}`}>
      <p className="eyebrow-text">{label}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  colors,
  index,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  colors: ReturnType<typeof getThemePalette>;
  index: number;
}) {
  return (
    <div
      className="premium-card reveal-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className="premium-card-icon"
        style={{
        color: "#ffffff",
          backgroundColor: colors.accentSoft,
        }}
      >
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function AudienceCard({
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
  return (
    <div
      className="audience-card reveal-up"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="audience-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
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
