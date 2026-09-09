"use client";

import { useState, useCallback } from "react";
import {
  ExternalLink,
  GitCommitHorizontal,
  Copy,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CommitRowSkeleton } from "@/components/ui/Skeleton";
import { formatRelativeDate, shortSha } from "@/lib/utils";
import type { UnifiedRawCommit, UnifiedRepo } from "@/lib/types";

// ─── Commit type → badge style ────────────────────────────────────────────────
const TYPE_STYLES: Record<
  string,
  { pill: string; dot: string }
> = {
  feat:     { pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  fix:      { pill: "bg-amber-500/10   text-amber-400   border-amber-500/20",   dot: "bg-amber-400" },
  refactor: { pill: "bg-cyan-500/10    text-cyan-400    border-cyan-500/20",    dot: "bg-cyan-400" },
  perf:     { pill: "bg-orange-500/10  text-orange-400  border-orange-500/20",  dot: "bg-orange-400" },
  test:     { pill: "bg-violet-500/10  text-violet-400  border-violet-500/20",  dot: "bg-violet-400" },
  build:    { pill: "bg-indigo-500/10  text-indigo-400  border-indigo-500/20",  dot: "bg-indigo-400" },
  ci:       { pill: "bg-teal-500/10    text-teal-400    border-teal-500/20",    dot: "bg-teal-400" },
  revert:   { pill: "bg-rose-500/10    text-rose-400    border-rose-500/20",    dot: "bg-rose-400" },
};

const ZINC_PILL = "bg-zinc-800 text-zinc-300 border-zinc-700";
const NON_CONV  = "bg-zinc-900 text-zinc-500 border-dashed border-zinc-700";

function TypeBadge({
  type,
  isConventional,
  isBreakingChange,
}: {
  type?: string | null;
  isConventional?: boolean | null;
  isBreakingChange?: boolean | null;
}) {
  const label = type?.toLowerCase() || "raw";
  const conv = isConventional ?? false;
  const breaking = isBreakingChange ?? false;
  const style = conv
    ? (TYPE_STYLES[label]?.pill ?? ZINC_PILL)
    : NON_CONV;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap",
          style
        )}
      >
        {conv && TYPE_STYLES[label] && (
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full shrink-0",
              TYPE_STYLES[label].dot
            )}
          />
        )}
        {conv ? label : "raw"}
      </span>
      {breaking && (
        <span className="inline-flex items-center rounded-full border border-rose-500/30 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-rose-400 whitespace-nowrap">
          !
        </span>
      )}
    </div>
  );
}

// ─── Copy-SHA button ──────────────────────────────────────────────────────────
function CopySha({ sha }: { sha: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(sha).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    },
    [sha]
  );

  return (
    <button
      onClick={copy}
      title={copied ? "Copied!" : "Copy SHA"}
      className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-zinc-700/60 text-zinc-500 hover:text-zinc-300"
    >
      {copied ? (
        <Check size={11} className="text-emerald-400" />
      ) : (
        <Copy size={11} />
      )}
    </button>
  );
}

// ─── Column header ────────────────────────────────────────────────────────────
function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-zinc-500 select-none">
      {children}
      <ChevronsUpDown size={10} className="opacity-30" />
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CommitListProps {
  commits: UnifiedRawCommit[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  selectedRepo: UnifiedRepo | null;
  hasSearched: boolean;
  onCommitClick: (sha: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CommitList({
  commits,
  totalCount,
  loading,
  error,
  selectedRepo,
  hasSearched,
  onCommitClick,
}: CommitListProps) {

  // ── Empty / pre-search state ─────────────────────────────────────────────
  if (!hasSearched && !loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <GitCommitHorizontal size={24} className="text-zinc-600" />
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-zinc-300">
            {selectedRepo
              ? `Search commits in ${selectedRepo.name}`
              : "Select a repository"}
          </h3>
          <p className="max-w-xs text-xs leading-relaxed text-zinc-600">
            {selectedRepo
              ? "Search conventional commits, scopes, or Jira keys using the search bar above. Press Enter to run."
              : "Pick a repository from the left panel to get started."}
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center">
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  // ── Loading — skeleton rows ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Table header skeleton */}
        <div className="grid grid-cols-[140px_80px_1fr_120px_88px_140px] items-center gap-4 border-b border-white/5 bg-zinc-900/40 px-4 py-2">
          {["Type", "Scope", "Description", "Jira", "SHA", "Author"].map((h) => (
            <ColHeader key={h}>{h}</ColHeader>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {Array.from({ length: 10 }).map((_, i) => (
            <CommitRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // ── No results ───────────────────────────────────────────────────────────
  if (commits.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/50">
          <GitCommitHorizontal size={20} className="text-zinc-700" />
        </div>
        <p className="text-sm text-zinc-500">No commits match your query.</p>
      </div>
    );
  }

  // ── Data Table ───────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">

      {/* ── Stats bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-white/5 bg-zinc-900/30 px-4 py-2">
        <span className="text-xs text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-300">{commits.length}</span>
          {totalCount > commits.length && (
            <>
              {" "}of{" "}
              <span className="font-semibold text-zinc-300">{totalCount}</span>
            </>
          )}{" "}
          commits
        </span>
        {commits.some((c) => c.parsedMessage?.isConventional) && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            conventional
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 ml-1" />
            non-conventional
          </span>
        )}
      </div>

      {/* ── Table container ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Column headers */}
        <div className="grid grid-cols-[140px_80px_1fr_120px_88px_140px] items-center gap-4 border-b border-white/5 bg-zinc-900/40 px-4 py-2 sticky top-0 z-10">
          <ColHeader>Type</ColHeader>
          <ColHeader>Scope</ColHeader>
          <ColHeader>Description</ColHeader>
          <ColHeader>Jira</ColHeader>
          <ColHeader>SHA</ColHeader>
          <ColHeader>Author / Date</ColHeader>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {commits.map((commit) => {
            const pm = commit.parsedMessage;
            
            // Safe property access defaults
            const isConventional = pm?.isConventional ?? false;
            const isBreaking = pm?.isBreakingChange ?? false;
            const type = pm?.type?.toLowerCase() || "raw";
            const scope = pm?.scope || null;
            const jiraKeys = pm?.jiraKeys ?? [];
            const displayDescription = pm?.description || pm?.rawMessage || (commit as any).message || commit.sha.substring(0, 7);
            const authorName = commit.authorName || "Unknown Author";

            return (
              <div
                key={commit.sha}
                role="row"
                tabIndex={0}
                onClick={() => onCommitClick(commit.sha)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onCommitClick(commit.sha);
                }}
                className={cn(
                  "group grid grid-cols-[140px_80px_1fr_120px_88px_140px] items-center gap-4",
                  "border-b border-white/5 px-4 py-2.5 cursor-pointer",
                  "transition-colors duration-150 hover:bg-zinc-900/70",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-zinc-600"
                )}
              >
                {/* ── Col 1: Type badge + BREAKING ── */}
                <TypeBadge
                  type={type}
                  isConventional={isConventional}
                  isBreakingChange={isBreaking}
                />

                {/* ── Col 2: Scope ── */}
                <div className="min-w-0">
                  {scope ? (
                    <span className="truncate rounded bg-zinc-800/60 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                      {scope}
                    </span>
                  ) : (
                    <span className="text-xs text-zinc-700">—</span>
                  )}
                </div>

                {/* ── Col 3: Description ── */}
                <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                  {displayDescription}
                </p>

                {/* ── Col 4: Jira keys ── */}
                <div className="flex min-w-0 flex-wrap gap-1">
                  {jiraKeys.length > 0 ? (
                    jiraKeys.slice(0, 2).map((key) => (
                      <span
                        key={key}
                        className="inline-block rounded border border-blue-500/20 bg-blue-500/10 px-1.5 py-0.5 font-mono text-[11px] text-blue-400"
                      >
                        {key}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-zinc-700">—</span>
                  )}
                  {jiraKeys.length > 2 && (
                    <span className="text-[11px] text-zinc-600">
                      +{jiraKeys.length - 2}
                    </span>
                  )}
                </div>

                {/* ── Col 5: SHA + actions ── */}
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {shortSha(commit.sha)}
                  </span>
                  {/* Actions revealed on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopySha sha={commit.sha} />
                    {commit.htmlUrl && (
                      <a
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open on GitHub"
                        className="flex h-5 w-5 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-zinc-300"
                      >
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Col 6: Author + relative date ── */}
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-zinc-300">
                    {authorName}
                  </p>
                  <p className="text-[11px] text-zinc-600">
                    {formatRelativeDate(commit.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
