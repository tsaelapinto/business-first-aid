import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockGetCase } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    let c;
    try {
      c = await prisma.businessCase.findUnique({ where: { id } });
    } catch {
      c = mockGetCase(id);
    }
    if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(c);
  } catch (err) {
    console.error("Result GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
