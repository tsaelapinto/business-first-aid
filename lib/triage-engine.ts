import { CrisisCategory, SupportLane } from "@/data/questions";

export type TriageAnswers = {
  q1MainProblem: string;
  q2Severity: string;
  q3Changes: string[];
  q4HelpNeeded: string;
  q5Urgency: string;
};

export type TriageResult = {
  severityScore: number;
  categories: CrisisCategory[];
  laneRecommended: SupportLane;
  diagnosisSummary: string;
  immediateActions: string[];
  priority: string;
};

// ─── Severity scoring ─────────────────────────────────────────────────────────
const SEVERITY_MAP: Record<string, number> = {
  mild: 1,
  moderate: 2,
  severe: 3,
  critical: 4,
};

const URGENCY_BONUS: Record<string, number> = {
  today: 1,
  "2_3_days": 0,
  week: 0,
  month: 0,
};

function computeSeverityScore(answers: TriageAnswers): number {
  const base = SEVERITY_MAP[answers.q2Severity] ?? 2;
  const urgency = URGENCY_BONUS[answers.q5Urgency] ?? 0;
  const changesCount = answers.q3Changes.length;
  const changeBonus = changesCount >= 5 ? 1 : 0;
  return Math.min(5, base + urgency + changeBonus);
}

// ─── Category classification ───────────────────────────────────────────────────
function classifyCategories(answers: TriageAnswers): CrisisCategory[] {
  const cats = new Set<CrisisCategory>();

  // Primary problem → category
  if (answers.q1MainProblem === "demand_drop") cats.add("revenue_demand");
  if (answers.q1MainProblem === "tourism_loss") cats.add("tourism");
  if (answers.q1MainProblem === "staffing") cats.add("operations_staffing");
  if (answers.q1MainProblem === "supply_chain") cats.add("supply_chain");
  if (answers.q1MainProblem === "cashflow") cats.add("cashflow_survival");
  if (answers.q1MainProblem === "overwhelmed") cats.add("leadership_overwhelm");

  // Secondary signals from q3
  if (answers.q3Changes.includes("revenue_drop")) cats.add("revenue_demand");
  if (answers.q3Changes.includes("tourism_disappeared")) cats.add("tourism");
  if (answers.q3Changes.includes("employees_unavailable")) cats.add("operations_staffing");
  if (answers.q3Changes.includes("supply_unreliable")) cats.add("supply_chain");
  if (answers.q3Changes.includes("marketing_not_working")) cats.add("marketing_effectiveness");
  if (answers.q3Changes.includes("no_clear_plan")) cats.add("leadership_overwhelm");

  // Help type signals
  if (answers.q4HelpNeeded === "tech_help") cats.add("digital_tech_gap");
  if (answers.q4HelpNeeded === "marketing_help") cats.add("marketing_effectiveness");
  if (answers.q4HelpNeeded === "finance_help") cats.add("cashflow_survival");
  if (answers.q4HelpNeeded === "prioritisation") cats.add("leadership_overwhelm");

  return Array.from(cats);
}

// ─── Lane recommendation ───────────────────────────────────────────────────────
function recommendLane(answers: TriageAnswers, categories: CrisisCategory[]): SupportLane {
  // Explicit help preference takes priority
  if (answers.q4HelpNeeded === "tech_help") return "tech_expert";
  if (answers.q4HelpNeeded === "marketing_help") return "campaign_manager";
  if (answers.q4HelpNeeded === "finance_help") return "finance_aid";

  // Category-based routing
  if (categories.includes("cashflow_survival")) return "finance_aid";
  if (categories.includes("digital_tech_gap")) return "tech_expert";
  if (categories.includes("marketing_effectiveness") || categories.includes("tourism")) {
    return "campaign_manager";
  }

  // Multi-category or leadership overwhelm → multi-disciplinary
  if (
    categories.length >= 3 ||
    categories.includes("leadership_overwhelm") ||
    answers.q1MainProblem === "overwhelmed" ||
    answers.q4HelpNeeded === "prioritisation" ||
    answers.q4HelpNeeded === "not_sure"
  ) {
    return "multi_disciplinary";
  }

  return "business_manager";
}

// ─── Diagnosis summary ────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<CrisisCategory, string> = {
  revenue_demand: "revenue and demand collapse",
  tourism: "tourism and footfall loss",
  operations_staffing: "operational and staffing disruption",
  supply_chain: "supply chain breakdown",
  cashflow_survival: "critical cashflow pressure",
  leadership_overwhelm: "leadership overwhelm",
  marketing_effectiveness: "marketing ineffectiveness",
  digital_tech_gap: "digital/tech enablement gaps",
};

const Q1_LABELS: Record<string, string> = {
  demand_drop: "a sharp drop in demand",
  tourism_loss: "disappearance of tourism or foot traffic",
  staffing: "staff shortages and operational disruption",
  supply_chain: "supply chain and logistics disruption",
  cashflow: "a critical cashflow crisis",
  overwhelmed: "overwhelming uncertainty about where to start",
  other: "a complex set of challenges",
};

const SEVERITY_LABELS: Record<string, string> = {
  mild: "Mild",
  moderate: "Moderate",
  severe: "Severe",
  critical: "Critical",
};

function buildDiagnosisSummary(answers: TriageAnswers, categories: CrisisCategory[]): string {
  const q1Label = Q1_LABELS[answers.q1MainProblem] ?? "business disruption";
  const severityLabel = SEVERITY_LABELS[answers.q2Severity] ?? "significant";
  const changesCount = answers.q3Changes.length;
  const catLabels = categories.slice(0, 3).map((c) => CATEGORY_LABELS[c]).join(", ");

  let urgencyNote = "";
  if (answers.q5Urgency === "today") urgencyNote = " Help is needed urgently, today.";
  else if (answers.q5Urgency === "2_3_days") urgencyNote = " Help is needed within 2–3 days.";

  return (
    `This business is experiencing ${severityLabel.toLowerCase()} impact from ${q1Label}. ` +
    `${changesCount} significant changes have been identified since the war began, ` +
    `including ${catLabels || "multiple disruptions"}. ` +
    `Primary crisis classifications: ${catLabels || "general disruption"}.` +
    urgencyNote
  );
}

// ─── Immediate actions ────────────────────────────────────────────────────────
const CATEGORY_ACTIONS: Record<CrisisCategory, string[]> = {
  revenue_demand: [
    "Conduct an emergency review of your top 3 revenue sources",
    "Identify customers with highest loyalty and reach out personally",
    "Consider bundled or discounted offers to stimulate short-term demand",
  ],
  tourism: [
    "Pivot marketing to local and domestic audiences immediately",
    "Explore partner promotions with complementary local businesses",
    "Create an 'upcoming reopening' campaign to rebuild anticipation",
  ],
  operations_staffing: [
    "Map out which operations are essential vs. can temporarily pause",
    "Explore cross-training existing staff to fill critical gaps",
    "Document all critical processes so knowledge is not lost",
  ],
  supply_chain: [
    "Identify and contact 2–3 alternative suppliers this week",
    "Review safety stock levels and adjust reorder points",
    "Communicate proactively with customers about lead time changes",
  ],
  cashflow_survival: [
    "Prepare a 30/60/90-day cashflow forecast immediately",
    "Contact your bank about emergency credit facilities or loan deferral",
    "Prioritise collecting outstanding receivables today",
  ],
  leadership_overwhelm: [
    "Write down the top 3 most urgent business threats on paper",
    "Schedule a focused 2-hour planning session within 48 hours",
    "Identify one trusted advisor or mentor to speak with this week",
  ],
  marketing_effectiveness: [
    "Pause underperforming campaigns and reallocate budget",
    "Audit your messaging: does it reflect the current reality?",
    "Test one new channel or format suited to wartime consumer behaviour",
  ],
  digital_tech_gap: [
    "List the top 3 manual processes that could be digitised quickly",
    "Explore free or low-cost digital tools for immediate relief",
    "Prioritise one digital improvement that would have the highest impact",
  ],
};

function generateImmediateActions(categories: CrisisCategory[], severity: number): string[] {
  const allActions: string[] = [];
  for (const cat of categories.slice(0, 3)) {
    const catActions = CATEGORY_ACTIONS[cat] ?? [];
    allActions.push(...catActions.slice(0, severity >= 3 ? 3 : 2));
  }
  // Deduplicate and cap
  return Array.from(new Set(allActions)).slice(0, 9);
}

// ─── Priority mapping ─────────────────────────────────────────────────────────
function derivePriority(severityScore: number): string {
  if (severityScore >= 4) return "critical";
  if (severityScore === 3) return "high";
  if (severityScore === 2) return "normal";
  return "low";
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function runTriageEngine(answers: TriageAnswers): TriageResult {
  const severityScore = computeSeverityScore(answers);
  const categories = classifyCategories(answers);
  const laneRecommended = recommendLane(answers, categories);
  const diagnosisSummary = buildDiagnosisSummary(answers, categories);
  const immediateActions = generateImmediateActions(categories, severityScore);
  const priority = derivePriority(severityScore);

  return {
    severityScore,
    categories,
    laneRecommended,
    diagnosisSummary,
    immediateActions,
    priority,
  };
}
