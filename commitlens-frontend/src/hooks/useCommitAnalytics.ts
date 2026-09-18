"use client";

import { useMemo } from "react";
import type { UnifiedParsedCommit, JiraCommitContext } from "@/lib/types";

// ─── Output Types ─────────────────────────────────────────────────────────────

export interface CommitKpi {
  /** (isConventional / total) * 100, rounded to 1 decimal */
  complianceRate: number;
  /** Count of commits where isBreakingChange === true */
  breakingChanges: number;
  /** Count of commits where type === 'feat' */
  featCount: number;
  /** Count of commits where type === 'fix' */
  fixCount: number;
  /** Number of unique author names */
  uniqueContributors: number;
  /** Total commit count */
  total: number;
}

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export interface AuthorBar {
  author: string;
  feat: number;
  fix: number;
  other: number;
  total: number;
}

export interface TimelinePoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface RepoFootprintBar {
  label: string; // e.g. "backend-service [Bitbucket]"
  count: number;
}

export interface CommitAnalytics {
  kpi: CommitKpi;
  donutData: DonutSlice[];
  authorStackData: AuthorBar[];
  timelineData: TimelinePoint[];
  repoFootprintData: RepoFootprintBar[];
}

// ─── Colour palette ───────────────────────────────────────────────────────────

const DONUT_COLORS: Record<string, string> = {
  feat: "#10b981",       // emerald-500
  fix: "#f43f5e",        // rose-500
  refactor: "#38bdf8",   // sky-400
  chore: "#a78bfa",      // violet-400
  docs: "#fbbf24",       // amber-400
  test: "#c084fc",       // purple-400
  perf: "#fb923c",       // orange-400
  build: "#818cf8",      // indigo-400
  ci: "#2dd4bf",         // teal-400
  revert: "#fb7185",     // rose-400
  "non-conventional": "#71717a", // zinc-500
};

function donutColor(type: string): string {
  return DONUT_COLORS[type] ?? "#71717a";
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCommitAnalyticsOptions {
  commits: UnifiedParsedCommit[];
  /**
   * Jira mode only — maps commit SHA → { owner, repo, provider }.
   * Required for repoFootprintData; ignored in GitHub mode.
   */
  jiraContextMap?: Map<string, JiraCommitContext>;
}

export function useCommitAnalytics({
  commits,
  jiraContextMap,
}: UseCommitAnalyticsOptions): CommitAnalytics {
  // ── KPI ───────────────────────────────────────────────────────────────────
  const kpi = useMemo<CommitKpi>(() => {
    const total = commits.length;
    if (total === 0) {
      return {
        complianceRate: 0,
        breakingChanges: 0,
        featCount: 0,
        fixCount: 0,
        uniqueContributors: 0,
        total: 0,
      };
    }

    let conventional = 0;
    let breaking = 0;
    let feat = 0;
    let fix = 0;
    const authors = new Set<string>();

    for (const c of commits) {
      const pm = c.parsedMessage;
      if (pm?.isConventional === true) conventional++;
      if (pm?.isBreakingChange === true) breaking++;
      const t = pm?.type?.toLowerCase();
      if (t === "feat") feat++;
      if (t === "fix") fix++;
      authors.add(c.rawCommitDto.authorName || "Unknown");
    }

    return {
      complianceRate: Math.round((conventional / total) * 1000) / 10, // 1 decimal
      breakingChanges: breaking,
      featCount: feat,
      fixCount: fix,
      uniqueContributors: authors.size,
      total,
    };
  }, [commits]);

  // ── Donut (commit type distribution) ─────────────────────────────────────
  const donutData = useMemo<DonutSlice[]>(() => {
    if (commits.length === 0) return [];

    const counts = new Map<string, number>();
    for (const c of commits) {
      const pm = c.parsedMessage;
      const type =
        pm?.isConventional && pm.type
          ? pm.type.toLowerCase()
          : "non-conventional";
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({
        name,
        value,
        color: donutColor(name),
      }));
  }, [commits]);

  // ── Author stacked bar (top 5) ────────────────────────────────────────────
  const authorStackData = useMemo<AuthorBar[]>(() => {
    if (commits.length === 0) return [];

    const map = new Map<string, { feat: number; fix: number; other: number }>();

    for (const c of commits) {
      const author = c.rawCommitDto.authorName || "Unknown";
      if (!map.has(author)) map.set(author, { feat: 0, fix: 0, other: 0 });
      const bucket = map.get(author)!;
      const t = c.parsedMessage?.type?.toLowerCase();
      if (t === "feat") bucket.feat++;
      else if (t === "fix") bucket.fix++;
      else bucket.other++;
    }

    return Array.from(map.entries())
      .map(([author, { feat, fix, other }]) => ({
        author,
        feat,
        fix,
        other,
        total: feat + fix + other,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [commits]);

  // ── Timeline (daily commit count — chronological ascending sort) ──────────
  const timelineData = useMemo<TimelinePoint[]>(() => {
    if (commits.length === 0) return [];

    const counts = new Map<string, number>();
    for (const c of commits) {
      const raw = c.rawCommitDto.date;
      if (!raw) continue;
      const day = raw.slice(0, 10); // YYYY-MM-DD from ISO string
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }

    // Sort chronologically: oldest → newest (left → right on X axis)
    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [commits]);

  // ── Repo footprint (Jira mode only) ───────────────────────────────────────
  const repoFootprintData = useMemo<RepoFootprintBar[]>(() => {
    if (!jiraContextMap || jiraContextMap.size === 0) return [];

    const counts = new Map<string, number>();
    for (const c of commits) {
      const sha = c.rawCommitDto.sha;
      const ctx = jiraContextMap.get(sha);
      if (!ctx) continue;
      const providerLabel =
        ctx.provider === "BITBUCKET" ? "Bitbucket" : "GitHub";
      const repoDisplayName = ctx.repoName || ctx.repo;
      const label = `${repoDisplayName} [${providerLabel}]`;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));
  }, [commits, jiraContextMap]);

  return { kpi, donutData, authorStackData, timelineData, repoFootprintData };
}
