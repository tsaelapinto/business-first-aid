"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BusinessCase } from "@prisma/client";
import { PriorityBadge, StatusBadge, LaneBadge, SeverityBar } from "@/components/Badges";
import { useI18n } from "@/components/I18nProvider";

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };

export default function CasesTable() {
  const [cases, setCases] = useState<BusinessCase[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [laneFilter, setLaneFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { t, lang } = useI18n();
  const dir = lang === "he" ? "rtl" : "ltr";

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    if (laneFilter) params.set("lane", laneFilter);
    const res = await fetch(`/api/cases?${params.toString()}`);
    const data = await res.json();
    setCases(data.sort((a: BusinessCase, b: BusinessCase) =>
      (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
    ));
    setLoading(false);
  }

  useEffect(() => { load(); }, [statusFilter, laneFilter]);

  const stats = {
    total: cases.length,
    critical: cases.filter((c) => c.priority === "critical").length,
    new: cases.filter((c) => c.status === "new").length,
    inReview: cases.filter((c) => c.status === "in-review").length,
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Dashboard heading */}
      <div className="mb-2">
        <h1 className="text-3xl font-black text-[var(--foreground)]">{t("backOfficeTitle")}</h1>
        <p className="text-[var(--muted)] mt-1">{t("backOfficeSubtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("statTotalCases"), value: stats.total, color: "text-[var(--foreground)]" },
          { label: t("statCritical"), value: stats.critical, color: "text-[var(--accent)]" },
          { label: t("statNew"), value: stats.new, color: "text-amber-600" },
          { label: t("statInReview"), value: stats.inReview, color: "text-blue-600" },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">{t("allStatuses")}</option>
          {["new", "in-review", "assigned", "resolved", "closed"].map((s) => (
            <option key={s} value={s}>{s.replace("-", " ")}</option>
          ))}
        </select>
        <select
          value={laneFilter}
          onChange={(e) => setLaneFilter(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm bg-white text-[var(--foreground)] focus:outline-none focus:border-[var(--accent)]"
        >
          <option value="">{t("allLanes")}</option>
          {["tech_expert", "campaign_manager", "business_manager", "finance_aid", "multi_disciplinary"].map((l) => (
            <option key={l} value={l}>{l.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button
          onClick={load}
          className="text-sm text-[var(--accent)] font-medium hover:underline"
        >
          {t("refreshBtn")}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">{t("loadingCases")}</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">{t("noCasesFound")}</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-[var(--border)]">
              <tr>
                {[t("colBusiness"), t("priorityLabel"), t("colStatus"), t("colLane"), t("colSeverity"), t("colDate"), ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-[var(--muted)] text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-[var(--foreground)]">
                      {c.businessName ?? "-"}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {c.ownerName ?? t("unknownOwner")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3">
                    <LaneBadge lane={c.laneRecommended} />
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBar score={c.severityScore} />
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted)]">
                    {new Date(c.createdAt).toLocaleDateString("en-IL", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/backoffice/cases/${c.id}`}
                      className="text-[var(--accent)] font-medium hover:underline text-xs"
                    >
                      {t("viewCase")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
