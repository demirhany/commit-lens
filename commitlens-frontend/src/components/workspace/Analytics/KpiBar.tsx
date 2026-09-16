"use client";

import { useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  GitMerge,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CommitKpi } from "@/hooks/useCommitAnalytics";

// ─── Compliance Progress Bar ──────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-500"
      : value >= 50
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="mt-2 h-1 w-full rounded-full bg-zinc-200 dark:bg-zinc-700/60 overflow-hidden">
      <div
        className={cn("h-full rounded-full transition-all duration-700", color)}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── Compliance Badge ─────────────────────────────────────────────────────────

function ComplianceBadge({ rate }: { rate: number }) {
  const { label, cls } = useMemo(() => {
    if (rate >= 80) return { label: "Great", cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" };
    if (rate >= 50) return { label: "Fair", cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" };
    return { label: "Low", cls: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20" };
  }, [rate]);

  return (
    <span className={cn("text-[10px] font-semibold uppercase tracking-wider rounded-full border px-2 py-0.5", cls)}>
      {label}
    </span>
  );
}

// ─── Single KPI Card ──────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  accentClass?: string;
}

function KpiCard({ icon, label, children, accentClass }: KpiCardProps) {
  return (
    <div className={cn(
      "flex flex-col gap-1 rounded-xl border px-4 py-3",
      "bg-white dark:bg-zinc-900/60",
      "border-zinc-200 dark:border-zinc-800/70",
      "shadow-sm",
      accentClass
    )}>
      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  );
}

// ─── KpiBar ───────────────────────────────────────────────────────────────────

interface KpiBarProps {
  kpi: CommitKpi;
}

export function KpiBar({ kpi }: KpiBarProps) {
  const {
    complianceRate,
    breakingChanges,
    featCount,
    fixCount,
    uniqueContributors,
    total,
  } = kpi;

  if (total === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-950/40">

      {/* 1. Conventional Compliance */}
      <KpiCard
        icon={<TrendingUp size={13} />}
        label="Compliance"
      >
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {complianceRate.toFixed(1)}
            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">%</span>
          </span>
          <ComplianceBadge rate={complianceRate} />
        </div>
        <ProgressBar value={complianceRate} />
        <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1">
          Conventional commits rate
        </p>
      </KpiCard>

      {/* 2. Breaking Changes */}
      <KpiCard
        icon={<AlertTriangle size={13} className={breakingChanges > 0 ? "text-rose-500" : ""} />}
        label="Breaking Changes"
        accentClass={breakingChanges > 0 ? "border-rose-300 dark:border-rose-500/30" : ""}
      >
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className={cn(
            "text-2xl font-bold tabular-nums",
            breakingChanges > 0
              ? "text-rose-600 dark:text-rose-400"
              : "text-zinc-900 dark:text-zinc-100"
          )}>
            {breakingChanges}
          </span>
          {breakingChanges > 0 && (
            <span className="text-rose-600 dark:text-rose-400 font-bold text-xl ml-1">
              !
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2">
          {breakingChanges === 0 ? "No breaking changes detected" : `In ${total} loaded commits`}
        </p>
      </KpiCard>

      {/* 3. Feat / Fix */}
      <KpiCard
        icon={<GitMerge size={13} />}
        label="Feat / Fix"
      >
        <div className="flex items-center gap-3 mt-1">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{featCount}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">feat</span>
          </div>
          <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold tabular-nums text-rose-500 dark:text-rose-400">{fixCount}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">fix</span>
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1.5">
          {((featCount + fixCount) / total * 100).toFixed(0)}% of all commits
        </p>
      </KpiCard>

      {/* 4. Unique Contributors */}
      <KpiCard
        icon={<Users size={13} />}
        label="Contributors"
      >
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {uniqueContributors}
          </span>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-500">unique</span>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2">
          Across {total} commits loaded
        </p>
      </KpiCard>
    </div>
  );
}
