"use client";

import { severity, type Reading, type Thresholds } from "@/lib/readings";

type GroupedDay = { date: string; rows: Reading[] };

function groupByDate(readings: Reading[]): GroupedDay[] {
  const by: Record<string, Reading[]> = {};
  for (const r of readings) (by[r.date] ||= []).push(r);
  return Object.entries(by)
    .map(([date, rows]) => ({ date, rows }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

const toneClasses: Record<"alarming" | "elevated" | "ok", string> = {
  alarming: "text-red-600",
  elevated: "text-amber-600",
  ok: "text-neutral-900",
};

export default function ReadingsList({
  readings,
  thresholds,
  onDelete,
}: {
  readings: Reading[];
  thresholds: Thresholds;
  onDelete: (id: string) => Promise<void>;
}) {
  if (readings.length === 0) return null;
  const groups = groupByDate(readings);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-4 py-2 text-sm font-medium text-neutral-600">
        All readings
      </div>
      <ul>
        {groups.map((g) => (
          <li key={g.date} className="border-b border-neutral-100 last:border-b-0">
            <div className="bg-neutral-50 px-4 py-1.5 text-xs font-medium text-neutral-500">
              {g.date}
            </div>
            <ul>
              {g.rows.map((r) => {
                const tone = severity(r.sys, r.dia, thresholds);
                return (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                  >
                    <div
                      className={`tabular-nums text-base font-medium ${toneClasses[tone]}`}
                    >
                      {r.sys}/{r.dia}
                      <span className="ml-3 text-sm font-normal text-neutral-500">
                        {r.pulse} bpm
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("Delete this reading?")) void onDelete(r.id);
                      }}
                      className="text-neutral-400 hover:text-red-600 px-2 py-1 -mr-2"
                      aria-label="Delete reading"
                    >
                      ✕
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
