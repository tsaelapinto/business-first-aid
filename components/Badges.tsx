import { PRIORITY_COLORS, STATUS_COLORS } from "@/lib/types";
import { SUPPORT_LANES, CRISIS_CATEGORIES } from "@/data/questions";

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status.replace("-", " ")}
    </span>
  );
}

export function LaneBadge({ lane }: { lane: string }) {
  const label = SUPPORT_LANES[lane as keyof typeof SUPPORT_LANES] ?? lane;
  const colorMap: Record<string, string> = {
    tech_expert: "bg-indigo-100 text-indigo-700",
    campaign_manager: "bg-pink-100 text-pink-700",
    business_manager: "bg-amber-100 text-amber-700",
    finance_aid: "bg-emerald-100 text-emerald-700",
    multi_disciplinary: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        colorMap[lane] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

export function SeverityBar({ score }: { score: number }) {
  const colors = ["", "bg-green-400", "bg-yellow-400", "bg-orange-400", "bg-red-500", "bg-red-700"];
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`h-2 w-5 rounded-full ${i <= score ? colors[score] : "bg-gray-200"}`}
        />
      ))}
      <span className="text-xs text-[var(--muted)] ml-1">{score}/5</span>
    </div>
  );
}

export function CategoryTags({ categories }: { categories: string[] }) {
  const cats = Array.isArray(categories) ? categories : [];
  return (
    <div className="flex flex-wrap gap-1">
      {cats.map((cat) => {
        const label = CRISIS_CATEGORIES[cat as keyof typeof CRISIS_CATEGORIES] ?? cat;
        return (
          <span
            key={cat}
            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
