"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { LaneBadge, PriorityBadge, SeverityBar, CategoryTags } from "@/components/Badges";
import { useI18n } from "@/components/I18nProvider";
import { SUPPORT_LANES, SUPPORT_LANES_HE, CRISIS_CATEGORIES_HE, CRISIS_CATEGORIES } from "@/data/questions";

interface ResultsClientProps {
  caseData: any; // Result from parseCase
}

export default function ResultsClient({ caseData: c }: ResultsClientProps) {
  const { t, lang } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isHe = lang === "he";
  const lanes = isHe ? SUPPORT_LANES_HE : SUPPORT_LANES;
  const cats = isHe ? CRISIS_CATEGORIES_HE : CRISIS_CATEGORIES;
    
  const laneName = (lanes as any)[c.laneRecommended] ?? c.laneRecommended;
  const translatedCategories = (c.categoriesList ?? []).map((cat: string) => (cats as any)[cat] ?? cat);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">

        {/* Header */}
        <div className="card bg-[var(--accent)] text-white border-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="opacity-80 text-sm font-medium mb-1">{t("triageComplete")}</p>
              <h1 className="text-2xl font-black leading-tight">
                {c.businessName 
                  ? `${c.businessName}: ${t("crisisReport")}` 
                  : (isHe ? `דו״ח משבר עבור העסק שלך` : `Your Business Crisis Report`)}
              </h1>
              <p className="opacity-70 text-sm mt-2">
                {t("caseIdLabel")}: <span className="font-mono">{c.id}</span>
              </p>
            </div>
            <PriorityBadge priority={c.priority} />
          </div>
        </div>

        {/* Severity */}
        <div className="card">
          <h2 className="font-bold text-[var(--foreground)] mb-4">{t("severityAssessment")}</h2>
          <SeverityBar score={c.severityScore} />
          <p className="text-sm text-[var(--muted)] mt-2">
            {t("severityScoreLabel")}: {c.severityScore}/5 | {t("priorityLabel")}: <strong>{c.priority}</strong>
          </p>
        </div>

        {/* Diagnosis summary */}
        <div className="card">
          <h2 className="font-bold text-[var(--foreground)] mb-3">{t("diagnosisSummary")}</h2>
          <p className="text-sm text-[var(--muted)] leading-relaxed">{c.diagnosisSummary}</p>
        </div>

        {/* Crisis categories */}
        <div className="card">
          <h2 className="font-bold text-[var(--foreground)] mb-3">{t("crisisCategories")}</h2>
          <CategoryTags categories={translatedCategories} />
        </div>

        {/* Lane recommendation */}
        <div className="card border-2 border-[var(--accent)] text-start">
          <p className="text-xs font-semibold text-[var(--accent)] uppercase tracking-widest mb-2">
            {t("supportLane")}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <LaneBadge lane={c.laneRecommended} />
            <span className="font-bold text-[var(--foreground)]">{laneName}</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            {isHe ? (
              <>
                על סמך תשובותיך, התיק שלך שובץ למסלול התמיכה של <strong>{laneName}</strong>. מומחה יסקור את המקרה שלך ויצור איתך קשר ישירות.
              </>
            ) : (
              <>
                Based on your answers, your case has been assigned to the{" "}
                <strong>{laneName}</strong> support lane. A specialist will review
                your case and reach out to you directly.
              </>
            )}
          </p>
        </div>

        {/* Immediate actions */}
        <div className="card">
          <h2 className="font-bold text-[var(--foreground)] mb-4">
            {t("immediateActions")}
          </h2>
          {c.immediateActionsList.length > 0 ? (
            <ol className="space-y-3">
              {c.immediateActionsList.map((action: string, i: number) => (
                <li key={i} className="flex gap-3 items-start text-sm">
                  <span className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold flex-shrink-0 text-xs mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-[var(--foreground)] leading-relaxed">{action}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-[var(--muted)]">No immediate actions generated.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/triage" className="btn-secondary text-center">
            {t("startNew")}
          </Link>
          <Link href="/" className="btn-primary text-center">
            {isHe ? "חזרה לדף הבית" : "Return to Home"}
          </Link>
        </div>

      </main>
    </div>
  );
}
