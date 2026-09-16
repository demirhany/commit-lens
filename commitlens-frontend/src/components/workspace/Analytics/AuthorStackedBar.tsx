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
import type { AuthorBar } from "@/hooks/useCommitAnalytics";

// ─── Colours ──────────────────────────────────────────────────────────────────

const FEAT_COLOR = "#10b981";  // emerald-500
const FIX_COLOR = "#f43f5e";   // rose-500
const OTHER_COLOR = "#6366f1"; // indigo-500

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + p.value, 0);

  return (
    <div className="rounded-lg border border-zinc-700/60 bg-zinc-800/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm min-w-[140px]">
      <p className="font-semibold text-zinc-100 mb-1.5 truncate max-w-[160px]">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.fill }} />
            <span className="text-zinc-400 capitalize">{p.name}</span>
          </div>
          <span className="tabular-nums font-medium text-zinc-200">{p.value}</span>
        </div>
      ))}
      <div className="mt-1.5 pt-1.5 border-t border-zinc-700 flex justify-between">
        <span className="text-zinc-500">Total</span>
        <span className="tabular-nums font-semibold text-zinc-300">{total}</span>
      </div>
    </div>
  );
}

// ─── Truncated Author Label ────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────

interface AuthorStackedBarProps {
  data: AuthorBar[];
}

export function AuthorStackedBar({ data }: AuthorStackedBarProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-zinc-500">
        No data
      </div>
    );
  }

  return (
    // Fixed height prevents Next.js App Router ResponsiveContainer warnings
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
          barSize={14}
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
            dataKey="author"
            width={90}
            tickFormatter={(v: string) => v.length > 14 ? v.slice(0, 13) + "…" : v}
            tick={{ fontSize: 11, fill: "#a1a1aa" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="feat" stackId="a" fill={FEAT_COLOR} name="feat" radius={[0, 0, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`feat-${entry.author}`} fill={FEAT_COLOR} />
            ))}
          </Bar>
          <Bar dataKey="fix" stackId="a" fill={FIX_COLOR} name="fix">
            {data.map((entry) => (
              <Cell key={`fix-${entry.author}`} fill={FIX_COLOR} />
            ))}
          </Bar>
          <Bar dataKey="other" stackId="a" fill={OTHER_COLOR} name="other" radius={[0, 3, 3, 0]}>
            {data.map((entry) => (
              <Cell key={`other-${entry.author}`} fill={OTHER_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
