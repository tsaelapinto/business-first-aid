import { BusinessCase } from "@prisma/client";

export type { BusinessCase };

export type CaseStatus = "new" | "in-review" | "assigned" | "resolved" | "closed";
export type CasePriority = "low" | "normal" | "high" | "critical";

export type CaseWithParsed = BusinessCase & {
  categoriesList: string[];
  immediateActionsList: string[];
  q3ChangesList: string[];
};

export function parseCase(c: BusinessCase): CaseWithParsed {
  return {
    ...c,
    categoriesList: c.categories ? c.categories.split(",").filter(Boolean) : [],
    immediateActionsList: (() => {
      try {
        return JSON.parse(c.immediateActions || "[]");
      } catch {
        return [];
      }
    })(),
    q3ChangesList: c.q3Changes ? c.q3Changes.split(",").filter(Boolean) : [],
  };
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

export const STATUS_COLORS: Record<string, string> = {
  new: "bg-yellow-100 text-yellow-800",
  "in-review": "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-700",
};
