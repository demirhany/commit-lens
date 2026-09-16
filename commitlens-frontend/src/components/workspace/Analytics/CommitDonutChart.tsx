"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DonutSlice } from "@/hooks/useCommitAnalytics";

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: DonutSlice;
}

function CustomTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const { name, value, payload: slice } = payload[0];
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";

  return (
    <div className="rounded-lg border border-zinc-700/60 bg-zinc-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: slice.color }}
        />
        <span className="font-semibold text-zinc-100 capitalize">{name}</span>
      </div>
      <p className="text-zinc-300 tabular-nums">
        {value} commit{value !== 1 ? "s" : ""}{" "}
        <span className="text-zinc-500">({pct}%)</span>
      </p>
    </div>
  );
}

// ─── Custom Legend ─────────────────────────────────────────────────────────────

interface LegendPayloadItem {
  value: string;
  color: string;
}

function CustomLegend({ payload }: { payload?: LegendPayloadItem[] }) {
  if (!payload?.length) return null;
  return (
    <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-2">
      {payload.map((entry) => (
        <li key={entry.value} className="flex items-center gap-1 text-[11px] text-zinc-400">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
          <span className="capitalize">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CommitDonutChartProps {
  data: DonutSlice[];
  total: number;
}

export function CommitDonutChart({ data, total }: CommitDonutChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        No data
      </div>
    );
  }

  return (
    // Outer div with fixed height prevents ResponsiveContainer from emitting
    // width=-1 / height=-1 warnings on Next.js App Router first render.
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius="50%"
            outerRadius="75%"
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={600}
          >
            {data.map((slice) => (
              <Cell key={slice.name} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip total={total} />}
            cursor={false}
          />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
