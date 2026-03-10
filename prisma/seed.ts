import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { runTriageEngine, TriageAnswers } from "../lib/triage-engine";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_BUSINESSES: Array<{
  businessName: string;
  ownerName: string;
  email: string;
  industry: string;
  location: string;
  answers: TriageAnswers;
}> = [
  {
    businessName: "Café Rimon — Tel Aviv",
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
      q3Changes: [
        "revenue_drop",
        "tourism_disappeared",
        "closed_temporarily",
        "costs_increased",
        "no_clear_plan",
      ],
      q4HelpNeeded: "finance_help",
      q5Urgency: "today",
    },
  },
];

async function main() {
  console.log("Seeding database...");

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
    console.log(`  ✓ ${demo.businessName}`);
  }

  console.log(`\nSeeded ${DEMO_BUSINESSES.length} demo businesses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
