"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useI18n } from "@/components/I18nProvider";

const LANES = [
  { icon: "💻", titleKey: "Tech Expert", descKey: "Digital systems, e-commerce, automation" },
  { icon: "📣", titleKey: "Campaign Manager", descKey: "Marketing, brand, demand recovery" },
  { icon: "🏢", titleKey: "Business Manager", descKey: "Operations, staffing, planning" },
  { icon: "💰", titleKey: "Finance Aid", descKey: "Cashflow, loans, emergency relief" },
  { icon: "🔀", titleKey: "Multi-Disciplinary", descKey: "Complex cases requiring multiple experts" },
];

export default function HomePage() {
  const { t } = useI18n();

  const STATS = [
    { value: t("statUnder2"), label: t("statUnder2Label") },
    { value: t("stat5"), label: t("stat5Label") },
    { value: t("stat8"), label: t("stat8Label") },
    { value: t("stat5lanes"), label: t("stat5lanesLabel") },
  ];

  const STEPS = [
    { step: "1", title: t("step1Title"), desc: t("step1Desc") },
    { step: "2", title: t("step2Title"), desc: t("step2Desc") },
    { step: "3", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-sm text-red-700 font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          {t("heroBadge")}
        </div>
        <h1 className="text-5xl font-black text-[var(--foreground)] leading-tight mb-6">
          {t("heroTitle1")}
          <br />
          <span className="text-[var(--accent)]">{t("heroTitle2")}</span>
        </h1>
        <p className="text-xl text-[var(--muted)] max-w-2xl mx-auto leading-relaxed mb-10">
          {t("heroDesc")}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/triage" className="btn-primary text-lg px-8 py-5 inline-block" data-testid="start-triage-link">
            {t("startTriage")}
          </Link>
          <Link href="/backoffice" className="btn-secondary text-lg px-8 py-5 inline-block">
            {t("backOfficeDashboard")}
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-black text-[var(--accent)]">{s.value}</div>
              <div className="text-xs text-[var(--muted)] mt-1 leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <h2 className="text-2xl font-bold text-center text-[var(--foreground)] mb-8" data-testid="how-it-works-heading">
          {t("howItWorks")}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {STEPS.map((item) => (
            <div key={item.step} className="card">
              <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-black text-lg mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-[var(--foreground)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Support lanes */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-2xl font-bold text-center text-[var(--foreground)] mb-8">
          {t("lanesTitle")}
        </h2>
        <div className="grid sm:grid-cols-5 gap-3">
          {LANES.map((lane) => (
            <div key={lane.titleKey} className="card text-center">
              <div className="text-3xl mb-2">{lane.icon}</div>
              <div className="font-bold text-sm text-[var(--foreground)]">{lane.titleKey}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{lane.descKey}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[var(--accent)] py-16 text-center text-white">
        <h2 className="text-3xl font-black mb-4">{t("heroTitle1")} {t("heroTitle2")}</h2>
        <p className="text-red-100 mb-8 max-w-md mx-auto">{t("heroDesc")}</p>
        <Link href="/triage" className="bg-white text-[var(--accent)] px-8 py-4 rounded-xl font-bold text-lg inline-block hover:opacity-90 transition">
          {t("startTriage")}
        </Link>
      </section>
    </div>
  );
}
