"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { TimelinePoint } from "@/hooks/useCommitAnalytics";

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
      <p className="font-semibold text-zinc-300 mb-0.5">{label}</p>
      <p className="tabular-nums text-indigo-300">
        {count} commit{count !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ─── Date tick formatter ──────────────────────────────────────────────────────

function formatAxisDate(dateStr: string): string {
  // YYYY-MM-DD → "Sep 12" (locale-independent short format)
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CommitTimelineProps {
  data: TimelinePoint[];
}

export function CommitTimeline({ data }: CommitTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        No data
      </div>
    );
  }

  // Show at most every Nth tick to avoid overcrowding on the X axis
  const maxTicks = 8;
  const step = Math.max(1, Math.ceil(data.length / maxTicks));
  const ticks = data
    .filter((_, i) => i % step === 0 || i === data.length - 1)
    .map((d) => d.date);

  return (
    // Fixed height prevents Next.js App Router ResponsiveContainer warnings
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
        >
          {/* Gradient fill definition */}
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            ticks={ticks}
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(99,102,241,0.4)", strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#commitGradient)"
            dot={false}
            activeDot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }}
            animationBegin={0}
            animationDuration={700}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
