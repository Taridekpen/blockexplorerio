import type { DataSource } from "@/types/explorer";

export function SourceBadge(_props: { source: DataSource }) {
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-300">
      Live
    </span>
  );
}
