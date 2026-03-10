import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { mockGetCase } from "@/lib/mock-data";
import { parseCase } from "@/lib/types";
import ResultsClient from "@/components/ResultsClient";

async function getCase(id: string) {
  try {
    if (prisma) return await prisma.businessCase.findUnique({ where: { id } });
  } catch { /* fall through */ }
  return mockGetCase(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCase(id);
  return {
    title: c
      ? `Results | Business First Aid`
      : "Results | Business First Aid",
  };
}

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const raw = await getCase(id);
  if (!raw) notFound();

  const c = parseCase(raw);

  return <ResultsClient caseData={c} />;
}
