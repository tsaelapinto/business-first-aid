import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockGetCase, mockUpdateCase } from "@/lib/mock-data";

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
    console.error("Case GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status, assignedTo, internalNotes, priority } = body;
    const patch = {
      ...(status !== undefined && { status }),
      ...(assignedTo !== undefined && { assignedTo }),
      ...(internalNotes !== undefined && { internalNotes }),
      ...(priority !== undefined && { priority }),
      ...(status === "resolved" && { resolvedAt: new Date() }),
    };
    let updated;
    try {
      updated = await prisma.businessCase.update({ where: { id }, data: patch });
    } catch {
      updated = mockUpdateCase(id, patch);
    }
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Case PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
