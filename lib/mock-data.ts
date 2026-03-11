/**
 * In-memory fallback data for production Vercel deployment.
 * SQLite is not available in Vercel serverless, so this module
 * provides the 6 seeded demo cases as static fallback data,
 * and an in-memory store for new triage submissions.
 */

import { BusinessCase } from "@prisma/client";
import { runTriageEngine } from "./triage-engine";

const now = new Date("2026-03-10T10:00:00Z");

const SEED_CASES: BusinessCase[] = [
  {
    id: "cafe-rimon@example.co.il",
    createdAt: new Date("2026-03-08T09:00:00Z"),
    updatedAt: new Date("2026-03-08T09:00:00Z"),
    businessName: "Café Rimon | Tel Aviv",
    ownerName: "Dafna Cohen",
    email: "dafna@caferimon.co.il",
    phone: null,
    industry: "Food & Beverage",
    location: "Tel Aviv",
    q1MainProblem: "tourism_loss",
    q2Severity: "critical",
    q3Changes: "revenue_drop,tourism_disappeared,closed_temporarily",
    q4HelpNeeded: "marketing_help",
    q5Urgency: "today",
    severityScore: 5,
    categories: "tourism,revenue_demand",
    laneRecommended: "campaign_manager",
    diagnosisSummary:
      "This business is experiencing critical impact from disappearance of tourism or foot traffic. 3 significant changes have been identified since the war began.",
    immediateActions: JSON.stringify([
      "Pivot marketing to local and domestic audiences immediately",
      "Explore partner promotions with complementary local businesses",
      "Create an 'upcoming reopening' campaign to rebuild anticipation",
      "Conduct an emergency review of your top 3 revenue sources",
    ]),
    status: "new",
    priority: "critical",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
  {
    id: "rotem@ceramics.co.il",
    createdAt: new Date("2026-03-08T10:30:00Z"),
    updatedAt: new Date("2026-03-08T10:30:00Z"),
    businessName: "Rotem Ceramics Studio",
    ownerName: "Rotem Levi",
    email: "rotem@ceramics.co.il",
    phone: null,
    industry: "Artisan / Crafts",
    location: "Jerusalem",
    q1MainProblem: "demand_drop",
    q2Severity: "moderate",
    q3Changes: "revenue_drop,marketing_not_working,no_clear_plan",
    q4HelpNeeded: "marketing_help",
    q5Urgency: "week",
    severityScore: 2,
    categories: "revenue_demand,marketing_effectiveness,leadership_overwhelm",
    laneRecommended: "campaign_manager",
    diagnosisSummary:
      "This business is experiencing moderate impact from a sharp drop in demand. 3 significant changes have been identified.",
    immediateActions: JSON.stringify([
      "Conduct an emergency review of your top 3 revenue sources",
      "Pause underperforming campaigns and reallocate budget",
      "Audit your messaging: does it reflect the current reality?",
    ]),
    status: "new",
    priority: "normal",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
  {
    id: "eyal@haifaflowers.co.il",
    createdAt: new Date("2026-03-09T08:00:00Z"),
    updatedAt: new Date("2026-03-09T08:00:00Z"),
    businessName: "Haifa Flowers & Events",
    ownerName: "Eyal Mizrahi",
    email: "eyal@haifaflowers.co.il",
    phone: null,
    industry: "Events / Retail",
    location: "Haifa",
    q1MainProblem: "staffing",
    q2Severity: "severe",
    q3Changes: "employees_unavailable,closed_temporarily,costs_increased",
    q4HelpNeeded: "operations_help",
    q5Urgency: "2_3_days",
    severityScore: 3,
    categories: "operations_staffing",
    laneRecommended: "business_manager",
    diagnosisSummary:
      "This business is experiencing severe impact from staff shortages and operational disruption. 3 changes identified.",
    immediateActions: JSON.stringify([
      "Map out which operations are essential vs. can temporarily pause",
      "Explore cross-training existing staff to fill critical gaps",
      "Document all critical processes so knowledge is not lost",
    ]),
    status: "new",
    priority: "high",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
  {
    id: "nir@nirtech.io",
    createdAt: new Date("2026-03-09T11:00:00Z"),
    updatedAt: new Date("2026-03-09T11:00:00Z"),
    businessName: "Nir Tech Solutions",
    ownerName: "Nir Ben-David",
    email: "nir@nirtech.io",
    phone: null,
    industry: "Technology / SaaS",
    location: "Herzliya",
    q1MainProblem: "overwhelmed",
    q2Severity: "moderate",
    q3Changes: "no_clear_plan,employees_unavailable,marketing_not_working",
    q4HelpNeeded: "prioritisation",
    q5Urgency: "week",
    severityScore: 2,
    categories: "leadership_overwhelm,operations_staffing,marketing_effectiveness",
    laneRecommended: "multi_disciplinary",
    diagnosisSummary:
      "This business is experiencing moderate impact from overwhelming uncertainty. 3 changes identified, multi-faceted crisis.",
    immediateActions: JSON.stringify([
      "Write down the top 3 most urgent business threats on paper",
      "Schedule a focused 2-hour planning session within 48 hours",
      "Identify one trusted advisor or mentor to speak with this week",
    ]),
    status: "new",
    priority: "normal",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
  {
    id: "shira@dsorganics.co.il",
    createdAt: new Date("2026-03-09T14:00:00Z"),
    updatedAt: new Date("2026-03-09T14:00:00Z"),
    businessName: "Dead Sea Organics",
    ownerName: "Shira Katz",
    email: "shira@dsorganics.co.il",
    phone: null,
    industry: "Health & Beauty / E-Commerce",
    location: "Beer Sheva",
    q1MainProblem: "supply_chain",
    q2Severity: "severe",
    q3Changes: "supply_unreliable,revenue_drop,costs_increased",
    q4HelpNeeded: "operations_help",
    q5Urgency: "2_3_days",
    severityScore: 3,
    categories: "supply_chain,revenue_demand",
    laneRecommended: "business_manager",
    diagnosisSummary:
      "This business is experiencing severe impact from supply chain and logistics disruption. 3 changes identified.",
    immediateActions: JSON.stringify([
      "Identify and contact 2–3 alternative suppliers this week",
      "Review safety stock levels and adjust reorder points",
      "Communicate proactively with customers about lead time changes",
    ]),
    status: "new",
    priority: "high",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
  {
    id: "avi@galilguest.co.il",
    createdAt: new Date("2026-03-10T07:00:00Z"),
    updatedAt: new Date("2026-03-10T07:00:00Z"),
    businessName: "Galil Guesthouse",
    ownerName: "Avi Schwartz",
    email: "avi@galilguest.co.il",
    phone: null,
    industry: "Tourism / Hospitality",
    location: "Galilee",
    q1MainProblem: "cashflow",
    q2Severity: "critical",
    q3Changes:
      "revenue_drop,tourism_disappeared,closed_temporarily,costs_increased,no_clear_plan",
    q4HelpNeeded: "finance_help",
    q5Urgency: "today",
    severityScore: 5,
    categories: "cashflow_survival,revenue_demand,tourism,leadership_overwhelm",
    laneRecommended: "finance_aid",
    diagnosisSummary:
      "This business is experiencing critical impact from a cashflow crisis. 5 significant changes identified. Help needed today.",
    immediateActions: JSON.stringify([
      "Prepare a 30/60/90-day cashflow forecast immediately",
      "Contact your bank about emergency credit facilities or loan deferral",
      "Prioritise collecting outstanding receivables today",
    ]),
    status: "in-review",
    priority: "critical",
    assignedTo: null,
    internalNotes: "",
    resolvedAt: null,
  },
];

// In-memory store for new submissions created during the serverless session
const IN_MEMORY_CASES = new Map<string, BusinessCase>(
  SEED_CASES.map((c) => [c.id, c])
);

export function mockGetAllCases(filters: { status?: string; lane?: string } = {}): BusinessCase[] {
  let cases = Array.from(IN_MEMORY_CASES.values());
  if (filters.status) cases = cases.filter((c) => c.status === filters.status);
  if (filters.lane) cases = cases.filter((c) => c.laneRecommended === filters.lane);
  return cases.sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, normal: 2, low: 3 };
    return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
  });
}

export function mockGetCase(id: string): BusinessCase | null {
  return IN_MEMORY_CASES.get(id) ?? null;
}

export function mockCreateCase(data: Omit<BusinessCase, "createdAt" | "updatedAt">): BusinessCase {
  const c: BusinessCase = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  IN_MEMORY_CASES.set(c.id, c);
  return c;
}

export function mockUpdateCase(
  id: string,
  patch: Partial<BusinessCase>
): BusinessCase | null {
  const existing = IN_MEMORY_CASES.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...patch, updatedAt: new Date() };
  IN_MEMORY_CASES.set(id, updated);
  return updated;
}

export function mockDeleteCase(id: string): boolean {
  // Never delete the static seed cases
  if (SEED_CASES.some((c) => c.id === id)) return false;
  return IN_MEMORY_CASES.delete(id);
}
