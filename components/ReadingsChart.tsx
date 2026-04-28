"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dailyAverages, type Reading, type Thresholds } from "@/lib/readings";

const OK = "#16a34a";
const ELEVATED = "#d97706";
const ALARMING = "#dc2626";

const dotColor = (v: number, lo: number, hi: number) =>
  v >= hi ? ALARMING : v >= lo ? ELEVATED : OK;

type DotProps = {
  cx?: number;
  cy?: number;
  key?: string;
  payload?: { sys: number; dia: number };
};

function makeDot(metric: "sys" | "dia", lo: number, hi: number, r: number) {
  return (props: DotProps) => {
    const { cx, cy, payload, key } = props;
    if (cx == null || cy == null || !payload) return null;
    const fill = dotColor(payload[metric], lo, hi);
    return (
      <circle
        key={key}
        cx={cx}
        cy={cy}
        r={r}
        fill={fill}
        stroke="#fff"
        strokeWidth={1}
      />
    );
  };
}

export default function ReadingsChart({
  readings,
  thresholds,
}: {
  readings: Reading[];
  thresholds: Thresholds;
}) {
  const data = dailyAverages(readings);
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center text-sm text-neutral-500">
        No readings yet — add one above to see the chart.
      </div>
    );
  }

  const allValues = data.flatMap((d) => [d.sys, d.dia, d.pulse]);
  const minVal = Math.min(...allValues, 40);
  const maxVal = Math.max(...allValues, 150);
  const yMin = Math.floor((minVal - 5) / 10) * 10;
  const yMax = Math.ceil((maxVal + 5) / 10) * 10;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="mb-1 flex items-baseline justify-between px-1">
        <h2 className="text-sm font-medium text-neutral-600">Daily averages</h2>
        <span className="text-[11px] text-neutral-400">
          {data.length} day{data.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 12, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#64748b" }}
              tickFormatter={(d: string) => d.slice(5)}
              minTickGap={20}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#64748b" }}
              domain={[yMin, yMax]}
              width={36}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
              }}
              labelFormatter={(d) => `Date: ${d}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            <ReferenceArea
              y1={thresholds.alarming.sys}
              y2={yMax}
              fill="#fee2e2"
              fillOpacity={0.5}
              ifOverflow="extendDomain"
            />
            <ReferenceArea
              y1={thresholds.elevated.sys}
              y2={thresholds.alarming.sys}
              fill="#fef3c7"
              fillOpacity={0.5}
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={thresholds.alarming.dia}
              stroke={ALARMING}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={thresholds.elevated.dia}
              stroke={ELEVATED}
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <Line
              type="monotone"
              dataKey="sys"
              name="SYS"
              stroke="#2563eb"
              strokeWidth={2}
              dot={makeDot(
                "sys",
                thresholds.elevated.sys,
                thresholds.alarming.sys,
                3,
              )}
              activeDot={makeDot(
                "sys",
                thresholds.elevated.sys,
                thresholds.alarming.sys,
                5,
              )}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="dia"
              name="DIA"
              stroke="#0891b2"
              strokeWidth={2}
              dot={makeDot(
                "dia",
                thresholds.elevated.dia,
                thresholds.alarming.dia,
                3,
              )}
              activeDot={makeDot(
                "dia",
                thresholds.elevated.dia,
                thresholds.alarming.dia,
                5,
              )}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pulse"
              name="Pulse"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3, fill: "#7c3aed", stroke: "#fff", strokeWidth: 1 }}
              activeDot={{ r: 5, fill: "#7c3aed", stroke: "#fff", strokeWidth: 1 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
