"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { BusinessCase } from "@prisma/client";
import { parseCase } from "@/lib/types";
import {
  PriorityBadge,
  StatusBadge,
  LaneBadge,
  SeverityBar,
  CategoryTags,
} from "@/components/Badges";
import { SUPPORT_LANES, SUPPORT_LANES_HE } from "@/data/questions";
import Link from "next/link";
import { useI18n } from "@/components/I18nProvider";

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useI18n();
  const dir = lang === "he" ? "rtl" : "ltr";
  const lanes = lang === "he" ? SUPPORT_LANES_HE : SUPPORT_LANES;
  const TRIAGE_Q_LABELS: Record<string, string> = {
    q1MainProblem: t("triageQMain"),
    q2Severity: t("triageQSeverity"),
    q3Changes: t("triageQChanges"),
    q4HelpNeeded: t("triageQHelp"),
    q5Urgency: t("triageQUrgency"),
  };
  const [raw, setRaw] = useState<BusinessCase | null>(null);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setRaw(data);
        setStatus(data.status ?? "new");
        setPriority(data.priority ?? "normal");
        setAssignedTo(data.assignedTo ?? "");
        setNotes(data.internalNotes ?? "");
      });
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/cases/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, priority, assignedTo, internalNotes: notes }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!raw) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--muted)]">
        {t("loadingCase")}
      </div>
    );
  }

  const c = parseCase(raw);
  const laneName = (lanes as any)[c.laneRecommended] ?? c.laneRecommended;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }} dir={dir}>
      <nav className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-2xl font-black leading-none">+</span>
            <span className="font-bold text-lg">{t("appName")}</span>
          </Link>
          <Link href="/backoffice" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            {t("backToDashboard")}
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--foreground)]">
              {c.businessName ?? t("unnamedBusiness")}
            </h1>
            <p className="text-[var(--muted)] text-sm mt-1">
              {c.ownerName} {c.email && `· ${c.email}`} {c.location && `· ${c.location}`}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <PriorityBadge priority={c.priority} />
            <StatusBadge status={c.status} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-4">

            {/* Severity */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionSeverity")}</h3>
              <SeverityBar score={c.severityScore} />
            </div>

            {/* Lane */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionLane")}</h3>
              <LaneBadge lane={c.laneRecommended} />
              <p className="text-xs text-[var(--muted)] mt-2">{laneName}</p>
            </div>

            {/* Categories */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionCategories")}</h3>
              <CategoryTags categories={c.categoriesList} />
            </div>

            {/* Raw answers */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionResponses")}</h3>
              <dl className="space-y-2 text-xs">
                {Object.entries(TRIAGE_Q_LABELS).map(([key, label]) => {
                  let val = "";
                  if (key === "q1MainProblem") val = c.q1MainProblem;
                  else if (key === "q2Severity") val = c.q2Severity;
                  else if (key === "q3Changes") val = c.q3ChangesList.join(", ") || "-";
                  else if (key === "q4HelpNeeded") val = c.q4HelpNeeded;
                  else if (key === "q5Urgency") val = c.q5Urgency;
                  return (
                    <div key={key} className="flex gap-2">
                      <dt className="text-[var(--muted)] font-medium min-w-[120px]">{label}:</dt>
                      <dd className="text-[var(--foreground)]">{val}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Diagnosis */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionDiagnosis")}</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{c.diagnosisSummary}</p>
            </div>

            {/* Immediate actions */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">{t("sectionActions")}</h3>
              <ol className="space-y-2">
                {c.immediateActionsList.map((action: string, i: number) => (
                  <li key={i} className="flex gap-2 items-start text-xs">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold flex-shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-[var(--foreground)] leading-relaxed">{action}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Case management */}
            <div className="card space-y-4">
              <h3 className="font-bold text-sm text-[var(--foreground)]">{t("sectionManagement")}</h3>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">{t("fieldStatus")}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["new", "in-review", "assigned", "resolved", "closed"].map((s) => (
                    <option key={s} value={s}>{s.replace("-", " ")}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">{t("fieldPriority")}</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white"
                >
                  {["low", "normal", "high", "critical"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">{t("fieldAssignedTo")}</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder={t("fieldAssignedToPlaceholder")}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">{t("fieldNotes")}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={t("fieldNotesPlaceholder")}
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full disabled:opacity-70"
              >
                {saving ? t("savingBtn") : saved ? t("savedBtn") : t("saveChanges")}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
