"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { dailyAverages, type Reading, type Thresholds } from "@/lib/readings";

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
            <ReferenceLine
              y={thresholds.alarming.sys}
              stroke="#dc2626"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={thresholds.elevated.sys}
              stroke="#d97706"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={thresholds.alarming.dia}
              stroke="#dc2626"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <ReferenceLine
              y={thresholds.elevated.dia}
              stroke="#d97706"
              strokeDasharray="4 4"
              ifOverflow="extendDomain"
            />
            <Line
              type="monotone"
              dataKey="sys"
              name="SYS"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="dia"
              name="DIA"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="pulse"
              name="Pulse"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
