"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { RepoFootprintBar as RepoFootprintBarData } from "@/hooks/useCommitAnalytics";

// ─── Colour palette (cyclic) ──────────────────────────────────────────────────

const PALETTE = [
  "#6366f1", // indigo
  "#38bdf8", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#a78bfa", // violet
  "#2dd4bf", // teal
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const count = payload[0].value;
  return (
    <div className="rounded-lg border border-zinc-700/60 bg-zinc-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm">
      <p className="font-semibold text-zinc-200 mb-0.5 max-w-[200px] truncate">{label}</p>
      <p className="tabular-nums text-sky-300">
        {count} commit{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface RepoFootprintBarProps {
  data: RepoFootprintBarData[];
}

export function RepoFootprintBar({ data }: RepoFootprintBarProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        No repo data
      </div>
    );
  }

  return (
    // Fixed height prevents Next.js App Router ResponsiveContainer warnings
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 20, left: 16, bottom: 4 }}
          barSize={12}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tickFormatter={(v: string) => v.length > 22 ? v.slice(0, 21) + "…" : v}
            tick={{ fontSize: 10, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={entry.label}
                fill={PALETTE[index % PALETTE.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
