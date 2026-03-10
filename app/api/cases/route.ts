import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockGetAllCases } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const lane = searchParams.get("lane");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (lane) where.laneRecommended = lane;

    let cases;
    try {
      cases = await prisma.businessCase.findMany({
        where,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });
    } catch {
      cases = mockGetAllCases({ status: status ?? undefined, lane: lane ?? undefined });
    }

    return NextResponse.json(cases);
  } catch (err) {
    console.error("Cases GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
