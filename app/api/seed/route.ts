import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runTriageEngine } from "@/lib/triage-engine";

// Simple secret-key protection, set SEED_SECRET env var on Vercel
const SEED_SECRET = process.env.SEED_SECRET ?? "dev-seed-only";

const DEMO_BUSINESSES = [
  {
    businessName: "Cafe Rimon, Tel Aviv",
    ownerName: "Dafna Cohen",
    email: "dafna@caferimon.co.il",
    industry: "Food & Beverage",
    location: "Tel Aviv",
    answers: {
      q1MainProblem: "tourism_loss",
      q2Severity: "critical",
      q3Changes: ["revenue_drop", "tourism_disappeared", "closed_temporarily"],
      q4HelpNeeded: "marketing_help",
      q5Urgency: "today",
    },
  },
  {
    businessName: "Rotem Ceramics Studio",
    ownerName: "Rotem Levi",
    email: "rotem@ceramics.co.il",
    industry: "Artisan / Crafts",
    location: "Jerusalem",
    answers: {
      q1MainProblem: "demand_drop",
      q2Severity: "moderate",
      q3Changes: ["revenue_drop", "marketing_not_working", "no_clear_plan"],
      q4HelpNeeded: "marketing_help",
      q5Urgency: "week",
    },
  },
  {
    businessName: "Haifa Flowers & Events",
    ownerName: "Eyal Mizrahi",
    email: "eyal@haifaflowers.co.il",
    industry: "Events / Retail",
    location: "Haifa",
    answers: {
      q1MainProblem: "staffing",
      q2Severity: "severe",
      q3Changes: ["employees_unavailable", "closed_temporarily", "costs_increased"],
      q4HelpNeeded: "operations_help",
      q5Urgency: "2_3_days",
    },
  },
  {
    businessName: "Nir Tech Solutions",
    ownerName: "Nir Ben-David",
    email: "nir@nirtech.io",
    industry: "Technology / SaaS",
    location: "Herzliya",
    answers: {
      q1MainProblem: "overwhelmed",
      q2Severity: "moderate",
      q3Changes: ["no_clear_plan", "employees_unavailable", "marketing_not_working"],
      q4HelpNeeded: "prioritisation",
      q5Urgency: "week",
    },
  },
  {
    businessName: "Dead Sea Organics",
    ownerName: "Shira Katz",
    email: "shira@dsorganics.co.il",
    industry: "Health & Beauty / E-Commerce",
    location: "Beer Sheva",
    answers: {
      q1MainProblem: "supply_chain",
      q2Severity: "severe",
      q3Changes: ["supply_unreliable", "revenue_drop", "costs_increased"],
      q4HelpNeeded: "operations_help",
      q5Urgency: "2_3_days",
    },
  },
  {
    businessName: "Galil Guesthouse",
    ownerName: "Avi Schwartz",
    email: "avi@galilguest.co.il",
    industry: "Tourism / Hospitality",
    location: "Galilee",
    answers: {
      q1MainProblem: "cashflow",
      q2Severity: "critical",
      q3Changes: ["revenue_drop", "tourism_disappeared", "closed_temporarily", "costs_increased", "no_clear_plan"],
      q4HelpNeeded: "finance_help",
      q5Urgency: "today",
    },
  },
];

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  for (const demo of DEMO_BUSINESSES) {
    const result = runTriageEngine(demo.answers);
    await prisma.businessCase.upsert({
      where: { id: demo.email },
      create: {
        id: demo.email,
        businessName: demo.businessName,
        ownerName: demo.ownerName,
        email: demo.email,
        industry: demo.industry,
        location: demo.location,
        q1MainProblem: demo.answers.q1MainProblem,
        q2Severity: demo.answers.q2Severity,
        q3Changes: demo.answers.q3Changes.join(","),
        q4HelpNeeded: demo.answers.q4HelpNeeded,
        q5Urgency: demo.answers.q5Urgency,
        severityScore: result.severityScore,
        categories: result.categories.join(","),
        laneRecommended: result.laneRecommended,
        diagnosisSummary: result.diagnosisSummary,
        immediateActions: JSON.stringify(result.immediateActions),
        priority: result.priority,
        status: demo.businessName.includes("Galil") ? "in-review" : "new",
      },
      update: {},
    });
    results.push(demo.businessName);
  }

  return NextResponse.json({
    ok: true,
    seeded: results,
    message: `Seeded ${results.length} demo businesses.`,
  });
}
