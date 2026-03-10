import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runTriageEngine, TriageAnswers } from "@/lib/triage-engine";
import { mockCreateCase } from "@/lib/mock-data";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      q1MainProblem,
      q2Severity,
      q3Changes,
      q4HelpNeeded,
      q5Urgency,
      businessName,
      ownerName,
      email,
      phone,
      industry,
      location,
    } = body;

    if (!q1MainProblem || !q2Severity || !q4HelpNeeded || !q5Urgency) {
      return NextResponse.json({ error: "Missing required triage answers" }, { status: 400 });
    }

    const answers: TriageAnswers = {
      q1MainProblem,
      q2Severity,
      q3Changes: Array.isArray(q3Changes) ? q3Changes : [],
      q4HelpNeeded,
      q5Urgency,
    };

    const result = runTriageEngine(answers);

    const caseData = {
      id: crypto.randomUUID(),
      businessName: businessName || null,
      ownerName: ownerName || null,
      email: email || null,
      phone: phone || null,
      industry: industry || null,
      location: location || null,
      q1MainProblem,
      q2Severity,
      q3Changes: answers.q3Changes.join(","),
      q4HelpNeeded,
      q5Urgency,
      severityScore: result.severityScore,
      categories: result.categories.join(","),
      laneRecommended: result.laneRecommended,
      diagnosisSummary: result.diagnosisSummary,
      immediateActions: JSON.stringify(result.immediateActions),
      priority: result.priority,
      status: "new",
      assignedTo: null,
      internalNotes: "",
      resolvedAt: null,
    };

    let newCase;
    try {
      newCase = await prisma.businessCase.create({ data: caseData });
    } catch {
      newCase = mockCreateCase(caseData);
    }

    return NextResponse.json({ id: newCase.id, result });
  } catch (err) {
    console.error("Triage POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
