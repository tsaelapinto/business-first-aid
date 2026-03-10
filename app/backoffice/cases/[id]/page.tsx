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
import { SUPPORT_LANES } from "@/data/questions";
import Link from "next/link";

const TRIAGE_Q_LABELS: Record<string, string> = {
  q1MainProblem: "Main Problem",
  q2Severity: "Severity",
  q3Changes: "Changes Since War",
  q4HelpNeeded: "Help Needed",
  q5Urgency: "Urgency",
};

export default function CaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
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
        Loading case…
      </div>
    );
  }

  const c = parseCase(raw);
  const laneName = SUPPORT_LANES[c.laneRecommended as keyof typeof SUPPORT_LANES] ?? c.laneRecommended;

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <nav className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[var(--accent)] text-2xl font-black leading-none">+</span>
            <span className="font-bold text-lg">Business First Aid</span>
          </Link>
          <Link href="/backoffice" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--foreground)]">
              {c.businessName ?? "Unnamed Business"}
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
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Severity</h3>
              <SeverityBar score={c.severityScore} />
            </div>

            {/* Lane */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Recommended Lane</h3>
              <LaneBadge lane={c.laneRecommended} />
              <p className="text-xs text-[var(--muted)] mt-2">{laneName}</p>
            </div>

            {/* Categories */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Crisis Categories</h3>
              <CategoryTags categories={c.categories} />
            </div>

            {/* Raw answers */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Triage Responses</h3>
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
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Diagnosis Summary</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{c.diagnosisSummary}</p>
            </div>

            {/* Immediate actions */}
            <div className="card">
              <h3 className="font-bold text-sm text-[var(--foreground)] mb-3">Immediate Actions</h3>
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
              <h3 className="font-bold text-sm text-[var(--foreground)]">Case Management</h3>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Status</label>
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
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Priority</label>
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
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Assigned To</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Team member name"
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted)] mb-1">Internal Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes for the team…"
                  className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white resize-none"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary w-full disabled:opacity-70"
              >
                {saving ? "Saving…" : saved ? "✓ Saved" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
