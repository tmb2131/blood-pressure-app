export type Reading = {
  id: string;
  date: string;
  sys: number;
  dia: number;
  pulse: number;
};

export type Thresholds = {
  elevated: { sys: number; dia: number };
  alarming: { sys: number; dia: number };
};

export const DEFAULT_THRESHOLDS: Thresholds = {
  elevated: { sys: 135, dia: 85 },
  alarming: { sys: 140, dia: 90 },
};

export type ReadingsFile = {
  version: 1;
  readings: Reading[];
  thresholds?: Thresholds;
};

export function getThresholds(f: { thresholds?: Thresholds }): Thresholds {
  return f.thresholds ?? DEFAULT_THRESHOLDS;
}

export function severity(
  sys: number,
  dia: number,
  t: Thresholds,
): "alarming" | "elevated" | "ok" {
  if (sys >= t.alarming.sys || dia >= t.alarming.dia) return "alarming";
  if (sys >= t.elevated.sys || dia >= t.elevated.dia) return "elevated";
  return "ok";
}

export function newId(date: string): string {
  return `r_${date}_${Math.random().toString(36).slice(2, 8)}`;
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export type DailyAverage = {
  date: string;
  sys: number;
  dia: number;
  pulse: number;
  count: number;
};

export function dailyAverages(readings: Reading[]): DailyAverage[] {
  const by: Record<string, Reading[]> = {};
  for (const r of readings) {
    (by[r.date] ||= []).push(r);
  }
  const round1 = (n: number) => Math.round(n * 10) / 10;
  return Object.entries(by)
    .map(([date, rows]) => {
      const n = rows.length;
      return {
        date,
        sys: round1(rows.reduce((a, b) => a + b.sys, 0) / n),
        dia: round1(rows.reduce((a, b) => a + b.dia, 0) / n),
        pulse: round1(rows.reduce((a, b) => a + b.pulse, 0) / n),
        count: n,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
