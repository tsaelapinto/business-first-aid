"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/components/I18nProvider";

const LANES = [
  { icon: "💻", title: "Tech Expert",          desc: "Digital systems, e-commerce, automation" },
  { icon: "📣", title: "Campaign Manager",     desc: "Marketing, brand, demand recovery" },
  { icon: "🏢", title: "Business Manager",     desc: "Operations, staffing, planning" },
  { icon: "💰", title: "Finance Aid",          desc: "Cashflow, loans, emergency relief" },
  { icon: "🔀", title: "Multi-Disciplinary",   desc: "Complex cases needing multiple experts" },
];

export default function HomePage() {
  const { t, lang } = useI18n();

  const STATS = [
    { value: t("statUnder2"),  label: t("statUnder2Label")  },
    { value: t("stat5"),       label: t("stat5Label")       },
    { value: t("stat8"),       label: t("stat8Label")       },
    { value: t("stat5lanes"),  label: t("stat5lanesLabel")  },
  ];

  const STEPS = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      {/* ───── HERO ───── */}
      <section className="hero-section">
        <div className="hero-inner" dir={lang === "he" ? "rtl" : "ltr"}>

          {/* Left: Copy */}
          <div>
            <div className="er-badge anim-fade-up">
              <span className="er-badge-dot" />
              {t("heroBadge")}
            </div>

            <h1 className="hero-h1 anim-fade-up anim-delay-1">
              {t("heroTitle1")}
              <br />
              <span className="hero-h1-accent">{t("heroTitle2")}</span>
            </h1>

            <p className="hero-desc anim-fade-up anim-delay-2">
              {t("heroDesc")}
            </p>

            <div className="hero-ctas anim-fade-up anim-delay-3">
              <Link href="/triage" className="btn-primary" data-testid="start-triage-link">
                {t("startTriage")}
              </Link>
              <Link href="/backoffice" className="btn-secondary">
                {t("backOfficeDashboard")}
              </Link>
            </div>

            <div className="hero-trust anim-fade-up anim-delay-4">
              <span className="trust-chip">
                <span className="trust-chip-check">✓</span> {t("heroTrustFree")}
              </span>
              <span className="trust-chip">
                <span className="trust-chip-check">✓</span> {t("heroTrustTime")}
              </span>
              <span className="trust-chip">
                <span className="trust-chip-check">✓</span> {t("heroTrustNoAccount")}
              </span>
            </div>
          </div>

          {/* Right: Doctor image */}
          <div className="hero-image-wrap anim-fade-up anim-delay-2 anim-float">
            <div className="doctor-frame">
              <Image
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=560&q=80"
                alt="Business Recovery Specialist"
                width={500}
                height={620}
                priority
                style={{ borderRadius: "2rem", width: "100%", height: "auto" }}
              />

              {/* Floating stat top-right */}
              <div className="stat-float stat-float-top">
                <div className="stat-float-icon">🩺</div>
                <div>
                  <div className="stat-float-num">24/7</div>
                  <div className="stat-float-label">{t("heroActiveLabel")}</div>
                </div>
              </div>

              {/* Floating stat bottom-left */}
              <div className="stat-float stat-float-bottom">
                <div className="stat-float-icon">✅</div>
                <div>
                  <div className="stat-float-num">1,200+</div>
                  <div className="stat-float-label">{t("heroResolvedLabel")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* EKG heartbeat line */}
        <div className="ekg-wrap">
          <svg viewBox="0 0 700 50" fill="none" preserveAspectRatio="none"
            style={{ width: "100%", height: "44px" }}>
            <path
              className="ekg-path"
              d="M0,25 L120,25 L140,25 L150,6 L162,44 L174,25 L200,25 L212,6 L224,44 L236,25 L270,25 L700,25"
              stroke="var(--teal)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="700"
              fill="none"
            />
          </svg>
        </div>
      </section>

      {/* ───── STATS BAND ───── */}
      <section className="stats-band">
        <div className="stats-band-inner">
          {STATS.map((s, i) => (
            <div key={s.label} className={`anim-fade-up anim-delay-${i + 1}`}>
              <div className="stat-num">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="section-std">
        <h2 className="section-title" data-testid="how-it-works-heading">
          {t("howItWorks")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {STEPS.map((item, i) => (
            <div key={item.step} className={`card anim-fade-up anim-delay-${i + 1}`}>
              <div className="step-number">{item.step}</div>
              <h3 className="font-bold mb-2 text-base" style={{ color: "var(--foreground)" }}>
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── SUPPORT LANES ───── */}
      <section style={{ background: "var(--teal-light)" }}>
        <div className="section-std" style={{ paddingTop: "3.5rem", paddingBottom: "4.5rem" }}>
          <h2 className="section-title">{t("lanesTitle")}</h2>
          <div className="grid sm:grid-cols-5 gap-4">
            {LANES.map((lane, i) => (
              <div key={lane.title} className={`lane-card anim-fade-up anim-delay-${i + 1}`}>
                <span className="lane-icon">{lane.icon}</span>
                <div className="lane-title">{lane.title}</div>
                <div className="lane-desc">{lane.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA BAND ───── */}
      <section style={{
        background: "var(--teal-dark)",
        padding: "5rem 2rem",
        textAlign: "center",
        color: "white",
      }}>
        <p style={{ fontSize: "0.8rem", letterSpacing: "0.12em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: "1rem" }}>
          {t("heroBadge")}
        </p>
        <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.6rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: "1.25rem", fontFamily: "var(--font-playfair, inherit)" }}>
          {t("heroTitle1")}
          <span style={{ color: "rgba(255,255,255,0.6)" }}> {t("heroTitle2")}</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: "2.5rem", maxWidth: "480px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
          {t("heroDesc")}
        </p>
        <Link
          href="/triage"
          className="btn-primary"
          style={{ fontSize: "1.05rem", padding: "1rem 2.25rem" }}
        >
          {t("startTriage")}
        </Link>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{
        background: "#061818",
        color: "rgba(255,255,255,0.35)",
        textAlign: "center",
        padding: "2rem 1.5rem",
        fontSize: "0.78rem",
        letterSpacing: "0.03em",
      }}>
        Business First Aid | Built for resilience.
      </footer>
    </div>
  );
}
