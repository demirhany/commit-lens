"use client";

import { useState } from "react";
import { ChevronDown, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommitAnalytics } from "@/hooks/useCommitAnalytics";
import { KpiBar } from "./KpiBar";
import { CommitDonutChart } from "./CommitDonutChart";
import { AuthorStackedBar } from "./AuthorStackedBar";
import { CommitTimeline } from "./CommitTimeline";
import { RepoFootprintBar } from "./RepoFootprintBar";
import type { UnifiedParsedCommit, JiraCommitContext } from "@/lib/types";

// ─── Section title ─────────────────────────────────────────────────────────────

function ChartSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/50 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-zinc-100 dark:border-zinc-800/60">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

// ─── AnalyticsDashboard ───────────────────────────────────────────────────────

interface AnalyticsDashboardProps {
  commits: UnifiedParsedCommit[];
  isJiraMode?: boolean;
  jiraContextMap?: Map<string, JiraCommitContext>;
}

export function AnalyticsDashboard({
  commits,
  isJiraMode = false,
  jiraContextMap,
}: AnalyticsDashboardProps) {
  const [expanded, setExpanded] = useState(false);

  const { kpi, donutData, authorStackData, timelineData, repoFootprintData } =
    useCommitAnalytics({
      commits,
      jiraContextMap: isJiraMode ? jiraContextMap : undefined,
    });

  // Don't render anything until we have commits
  if (commits.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-zinc-200 dark:border-zinc-800/60">
      {/* ── KPI Metric Bar — always visible ── */}
      <KpiBar kpi={kpi} />

      {/* ── Accordion toggle ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-4 py-2",
          "text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200",
          "border-t border-zinc-100 dark:border-zinc-800/50",
          "bg-zinc-50/60 dark:bg-zinc-950/30 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/40",
          "transition-colors cursor-pointer select-none"
        )}
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-1.5 font-medium">
          <BarChart2 size={12} />
          Analytics Charts
        </span>
        <ChevronDown
          size={13}
          className={cn("transition-transform duration-200", expanded ? "rotate-180" : "")}
        />
      </button>

      {/* ── Expanded charts area ── */}
      {expanded && (
        <div className="bg-zinc-50/40 dark:bg-zinc-950/20 px-4 py-4 space-y-4">

          {/* Row 1: Donut + Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartSection title="Commit Type Distribution">
              <CommitDonutChart data={donutData} total={kpi.total} />
            </ChartSection>

            <ChartSection title="Commit Timeline">
              <CommitTimeline data={timelineData} />
            </ChartSection>
          </div>

          {/* Row 2: Author stacked + (Jira-only) Repo Footprint */}
          <div className={cn(
            "grid gap-4",
            isJiraMode && repoFootprintData.length > 0
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1"
          )}>
            <ChartSection title="Top Contributors">
              <AuthorStackedBar data={authorStackData} />
            </ChartSection>

            {isJiraMode && repoFootprintData.length > 0 && (
              <ChartSection title="Repo Footprint">
                <RepoFootprintBar data={repoFootprintData} />
              </ChartSection>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
