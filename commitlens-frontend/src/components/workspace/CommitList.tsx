"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ExternalLink,
  GitCommitHorizontal,
  Copy,
  Check,
  ChevronsUpDown,
  Filter,
} from "lucide-react";
import { cn, formatDate, shortSha } from "@/lib/utils";
import { CommitRowSkeleton } from "@/components/ui/Skeleton";
import type { UnifiedRawCommit, UnifiedRepo } from "@/lib/types";
import { FilterChips, ActiveFilter } from "./DataTable/FilterChips";
import { ColumnFilterPopover } from "./DataTable/ColumnFilterPopover";

// ─── Commit type → badge style ────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { pill: string; dot: string }> = {
  feat: { pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400" },
  fix: { pill: "bg-amber-500/10   text-amber-400   border-amber-500/20", dot: "bg-amber-400" },
  refactor: { pill: "bg-cyan-500/10    text-cyan-400    border-cyan-500/20", dot: "bg-cyan-400" },
  perf: { pill: "bg-orange-500/10  text-orange-400  border-orange-500/20", dot: "bg-orange-400" },
  test: { pill: "bg-violet-500/10  text-violet-400  border-violet-500/20", dot: "bg-violet-400" },
  build: { pill: "bg-indigo-500/10  text-indigo-400  border-indigo-500/20", dot: "bg-indigo-400" },
  ci: { pill: "bg-teal-500/10    text-teal-400    border-teal-500/20", dot: "bg-teal-400" },
  revert: { pill: "bg-rose-500/10    text-rose-400    border-rose-500/20", dot: "bg-rose-400" },
};

const ZINC_PILL = "bg-zinc-800 text-zinc-300 border-zinc-700";
const NON_CONV = "bg-zinc-900 text-zinc-500 border-dashed border-zinc-700";

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
  const style = conv ? (TYPE_STYLES[label]?.pill ?? ZINC_PILL) : NON_CONV;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide whitespace-nowrap",
          style
        )}
      >
        {conv && TYPE_STYLES[label] && (
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", TYPE_STYLES[label].dot)} />
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
      {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
    </button>
  );
}

// ─── Column header ────────────────────────────────────────────────────────────
function ColHeader({
  children,
  isActive,
  onClick,
}: {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider select-none transition-colors group relative w-full text-left",
        isActive ? "text-indigo-400" : "text-zinc-500 hover:text-zinc-300"
      )}
    >
      {children}
      {isActive && (
        <span className="absolute -left-3 top-1 h-1.5 w-1.5 rounded-full bg-indigo-500" />
      )}
      <Filter
        size={10}
        className={cn(
          "transition-opacity ml-auto",
          isActive ? "opacity-100" : "opacity-30 group-hover:opacity-100"
        )}
      />
    </button>
  );
}

// ─── Props & State Interfaces ─────────────────────────────────────────────────
export interface TableFilters {
  types: string[];
  scopes: string[]; // includes 'none'
  description: string;
  jiraKeys: string[];
  hasJiraKey: boolean | null;
  shaPrefix: string;
  authors: string[];
  dateRange: { start: string; end: string } | null;
}

const defaultFilters: TableFilters = {
  types: [],
  scopes: [],
  description: "",
  jiraKeys: [],
  hasJiraKey: null,
  shaPrefix: "",
  authors: [],
  dateRange: null,
};

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
  const [filters, setFilters] = useState<TableFilters>(defaultFilters);
  const [openPopover, setOpenPopover] = useState<keyof TableFilters | null>(null);

  // ── Dynamic Options Extraction ──
  const uniqueTypes = useMemo(() => {
    const map = new Map<string, number>();
    commits.forEach((c) => {
      const type = c.parsedMessage?.type?.toLowerCase() || "raw";
      map.set(type, (map.get(type) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [commits]);

  const uniqueScopes = useMemo(() => {
    const map = new Map<string, number>();
    commits.forEach((c) => {
      const scope = c.parsedMessage?.scope || "none";
      map.set(scope, (map.get(scope) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [commits]);

  const uniqueJiraKeys = useMemo(() => {
    const map = new Map<string, number>();
    commits.forEach((c) => {
      const keys = c.parsedMessage?.jiraKeys ?? [];
      keys.forEach((k) => map.set(k, (map.get(k) || 0) + 1));
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [commits]);

  const uniqueAuthors = useMemo(() => {
    const map = new Map<string, number>();
    commits.forEach((c) => {
      const author = c.authorName || "Unknown Author";
      map.set(author, (map.get(author) || 0) + 1);
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [commits]);

  // ── Client-side Filtering ──
  const filteredCommits = useMemo(() => {
    return commits.filter((c) => {
      const pm = c.parsedMessage;

      // Type
      if (filters.types.length > 0) {
        const type = pm?.type?.toLowerCase() || "raw";
        if (!filters.types.includes(type)) return false;
      }

      // Scope
      if (filters.scopes.length > 0) {
        const scope = pm?.scope || "none";
        if (!filters.scopes.includes(scope)) return false;
      }

      // Description
      if (filters.description) {
        const desc = (pm?.description || pm?.rawMessage || (c as any).message || c.sha).toLowerCase();
        if (!desc.includes(filters.description.toLowerCase())) return false;
      }

      // Jira
      const keys = pm?.jiraKeys ?? [];
      if (filters.hasJiraKey === true) {
        if (keys.length === 0) return false;
      } else if (filters.hasJiraKey === false) {
        if (keys.length > 0) return false;
      } else if (filters.jiraKeys.length > 0) {
        if (!filters.jiraKeys.some((k) => keys.includes(k))) return false;
      }

      // SHA
      if (filters.shaPrefix && !c.sha.toLowerCase().startsWith(filters.shaPrefix.toLowerCase())) {
        return false;
      }

      // Author
      if (filters.authors.length > 0) {
        const author = c.authorName || "Unknown Author";
        if (!filters.authors.includes(author)) return false;
      }

      // Date Range
      if (filters.dateRange && c.date) {
        const cDate = new Date(c.date).getTime();
        const start = new Date(filters.dateRange.start).getTime();
        const end = new Date(filters.dateRange.end).setHours(23, 59, 59, 999);
        if (cDate < start || cDate > end) return false;
      }

      return true;
    });
  }, [commits, filters]);

  // ── Active Filters formatting for Chips ──
  const activeChips: ActiveFilter[] = useMemo(() => {
    const chips: ActiveFilter[] = [];
    if (filters.types.length > 0) {
      chips.push({
        key: "types",
        label: `Type: ${filters.types.join(", ")}`,
        onRemove: () => setFilters((prev) => ({ ...prev, types: [] })),
      });
    }
    if (filters.scopes.length > 0) {
      chips.push({
        key: "scopes",
        label: `Scope: ${filters.scopes.join(", ")}`,
        onRemove: () => setFilters((prev) => ({ ...prev, scopes: [] })),
      });
    }
    if (filters.description) {
      chips.push({
        key: "desc",
        label: `Desc: "${filters.description}"`,
        onRemove: () => setFilters((prev) => ({ ...prev, description: "" })),
      });
    }
    if (filters.hasJiraKey === true) {
      chips.push({
        key: "jira_has",
        label: "Has Jira Key",
        onRemove: () => setFilters((prev) => ({ ...prev, hasJiraKey: null })),
      });
    } else if (filters.hasJiraKey === false) {
      chips.push({
        key: "jira_none",
        label: "No Jira Key",
        onRemove: () => setFilters((prev) => ({ ...prev, hasJiraKey: null })),
      });
    } else if (filters.jiraKeys.length > 0) {
      chips.push({
        key: "jira_keys",
        label: `Jira: ${filters.jiraKeys.join(", ")}`,
        onRemove: () => setFilters((prev) => ({ ...prev, jiraKeys: [] })),
      });
    }
    if (filters.shaPrefix) {
      chips.push({
        key: "sha",
        label: `SHA: ${filters.shaPrefix}`,
        onRemove: () => setFilters((prev) => ({ ...prev, shaPrefix: "" })),
      });
    }
    if (filters.authors.length > 0) {
      chips.push({
        key: "authors",
        label: `Author: ${filters.authors.length} selected`,
        onRemove: () => setFilters((prev) => ({ ...prev, authors: [] })),
      });
    }
    if (filters.dateRange) {
      chips.push({
        key: "date",
        label: `Date: ${filters.dateRange.start} - ${filters.dateRange.end}`,
        onRemove: () => setFilters((prev) => ({ ...prev, dateRange: null })),
      });
    }
    return chips;
  }, [filters]);

  const handleClearAll = () => setFilters(defaultFilters);

  // ── Helper handlers ──
  const toggleArrayFilter = (key: keyof TableFilters, val: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  };

  // ── Render States ──
  if (!hasSearched && !loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60">
          <GitCommitHorizontal size={24} className="text-zinc-600" />
        </div>
        <div>
          <h3 className="mb-1.5 text-sm font-semibold text-zinc-300">
            {selectedRepo ? `Search commits in ${selectedRepo.name}` : "Select a repository"}
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

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center px-8 text-center">
        <p className="text-sm text-rose-400">{error}</p>
      </div>
    );
  }

  const GRID_COLS = "grid-cols-[140px_80px_1fr_120px_88px_140px_120px]";

  if (loading) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className={`grid ${GRID_COLS} items-center gap-4 border-b border-white/5 bg-zinc-900/40 px-4 py-2`}>
          {["Type", "Scope", "Description", "Jira", "SHA", "Author", "Date"].map((h) => (
            <div key={h} className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{h}</div>
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      <FilterChips
        filters={activeChips}
        onClearAll={handleClearAll}
        totalCount={totalCount}
        filteredCount={filteredCommits.length}
        hasConventionalCommits={commits.some((c) => c.parsedMessage?.isConventional)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Column headers */}
        <div className={`grid ${GRID_COLS} items-center gap-4 border-b border-white/5 bg-zinc-900/40 px-6 py-2 sticky top-0 z-10`}>
          
          {/* TYPE */}
          <div className="relative">
            <ColHeader
              isActive={filters.types.length > 0}
              onClick={() => setOpenPopover(openPopover === "types" ? null : "types")}
            >
              Type
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "types"} onClose={() => setOpenPopover(null)}>
              <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                {uniqueTypes.map(([val, count]) => (
                  <label key={val} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(val)}
                      onChange={() => toggleArrayFilter("types", val)}
                      className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                    />
                    <span className="flex-1 truncate">{val}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </label>
                ))}
              </div>
            </ColumnFilterPopover>
          </div>

          {/* SCOPE */}
          <div className="relative">
            <ColHeader
              isActive={filters.scopes.length > 0}
              onClick={() => setOpenPopover(openPopover === "scopes" ? null : "scopes")}
            >
              Scope
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "scopes"} onClose={() => setOpenPopover(null)}>
              <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                {uniqueScopes.map(([val, count]) => (
                  <label key={val} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.scopes.includes(val)}
                      onChange={() => toggleArrayFilter("scopes", val)}
                      className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                    />
                    <span className="flex-1 truncate">{val === "none" ? <i className="text-zinc-500">No scope</i> : val}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </label>
                ))}
              </div>
            </ColumnFilterPopover>
          </div>

          {/* DESCRIPTION */}
          <div className="relative">
            <ColHeader
              isActive={!!filters.description}
              onClick={() => setOpenPopover(openPopover === "description" ? null : "description")}
            >
              Description
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "description"} onClose={() => setOpenPopover(null)}>
              <input
                type="text"
                placeholder="Search description..."
                value={filters.description}
                onChange={(e) => setFilters((p) => ({ ...p, description: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-2 py-1.5 outline-none focus:border-indigo-500/50"
              />
            </ColumnFilterPopover>
          </div>

          {/* JIRA */}
          <div className="relative">
            <ColHeader
              isActive={filters.jiraKeys.length > 0 || filters.hasJiraKey !== null}
              onClick={() => setOpenPopover(openPopover === "jiraKeys" ? null : "jiraKeys")}
            >
              Jira
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "jiraKeys"} onClose={() => setOpenPopover(null)}>
              <div className="mb-2 pb-2 border-b border-zinc-800 flex flex-col gap-1.5">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.hasJiraKey === true}
                    onChange={() => setFilters((p) => ({ ...p, hasJiraKey: p.hasJiraKey === true ? null : true, jiraKeys: [] }))}
                    className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                  />
                  Has Jira Key
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.hasJiraKey === false}
                    onChange={() => setFilters((p) => ({ ...p, hasJiraKey: p.hasJiraKey === false ? null : false, jiraKeys: [] }))}
                    className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                  />
                  No Jira Key
                </label>
              </div>
              <div className="max-h-48 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                {uniqueJiraKeys.map(([val, count]) => (
                  <label key={val} className={`flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors ${filters.hasJiraKey !== null ? 'opacity-50 pointer-events-none' : ''}`}>
                    <input
                      type="checkbox"
                      checked={filters.jiraKeys.includes(val)}
                      onChange={() => toggleArrayFilter("jiraKeys", val)}
                      className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                      disabled={filters.hasJiraKey !== null}
                    />
                    <span className="flex-1 truncate">{val}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </label>
                ))}
              </div>
            </ColumnFilterPopover>
          </div>

          {/* SHA */}
          <div className="relative">
            <ColHeader
              isActive={!!filters.shaPrefix}
              onClick={() => setOpenPopover(openPopover === "shaPrefix" ? null : "shaPrefix")}
            >
              SHA
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "shaPrefix"} onClose={() => setOpenPopover(null)}>
              <input
                type="text"
                placeholder="Prefix..."
                value={filters.shaPrefix}
                onChange={(e) => setFilters((p) => ({ ...p, shaPrefix: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-2 py-1.5 outline-none focus:border-indigo-500/50"
              />
            </ColumnFilterPopover>
          </div>

          {/* AUTHOR */}
          <div className="relative">
            <ColHeader
              isActive={filters.authors.length > 0}
              onClick={() => setOpenPopover(openPopover === "authors" ? null : "authors")}
            >
              Author
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "authors"} onClose={() => setOpenPopover(null)} align="right">
              <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col gap-1.5">
                {uniqueAuthors.map(([val, count]) => (
                  <label key={val} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:bg-zinc-900 p-1 rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.authors.includes(val)}
                      onChange={() => toggleArrayFilter("authors", val)}
                      className="accent-indigo-500 rounded bg-zinc-900 border-zinc-700"
                    />
                    <span className="flex-1 truncate" title={val}>{val}</span>
                    <span className="text-[10px] text-zinc-500">({count})</span>
                  </label>
                ))}
              </div>
            </ColumnFilterPopover>
          </div>

          {/* DATE */}
          <div className="relative">
            <ColHeader
              isActive={!!filters.dateRange}
              onClick={() => setOpenPopover(openPopover === "dateRange" ? null : "dateRange")}
            >
              Date
            </ColHeader>
            <ColumnFilterPopover isOpen={openPopover === "dateRange"} onClose={() => setOpenPopover(null)} className="w-48" align="right">
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.start || ""}
                    onChange={(e) => setFilters(p => ({ ...p, dateRange: { start: e.target.value, end: p.dateRange?.end || e.target.value } }))}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-2 py-1.5 outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={filters.dateRange?.end || ""}
                    onChange={(e) => setFilters(p => ({ ...p, dateRange: { start: p.dateRange?.start || e.target.value, end: e.target.value } }))}
                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 text-xs rounded-md px-2 py-1.5 outline-none focus:border-indigo-500/50"
                  />
                </div>
                {filters.dateRange && (
                  <button
                    onClick={() => setFilters(p => ({ ...p, dateRange: null }))}
                    className="mt-1 w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] py-1 rounded transition-colors"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </ColumnFilterPopover>
          </div>
        </div>

        {/* Rows */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {filteredCommits.length === 0 ? (
             <div className="flex h-32 items-center justify-center text-sm text-zinc-500">
               No commits match your filters.
             </div>
          ) : (
            filteredCommits.map((commit) => {
              const pm = commit.parsedMessage;
              
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
                    `group grid ${GRID_COLS} items-center gap-4`,
                    "border-b border-white/5 px-6 py-2.5 cursor-pointer",
                    "transition-colors duration-150 hover:bg-zinc-900/70",
                    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-zinc-600"
                  )}
                >
                  {/* ── Col 1: Type badge + BREAKING ── */}
                  <TypeBadge type={type} isConventional={isConventional} isBreakingChange={isBreaking} />

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
                          className="inline-block rounded border border-indigo-500/20 bg-indigo-500/10 px-1.5 py-0.5 font-mono text-[11px] text-indigo-400"
                        >
                          {key}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-700">—</span>
                    )}
                    {jiraKeys.length > 2 && (
                      <span className="text-[11px] text-zinc-600">+{jiraKeys.length - 2}</span>
                    )}
                  </div>

                  {/* ── Col 5: SHA + actions ── */}
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
                      {shortSha(commit.sha)}
                    </span>
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

                  {/* ── Col 6: Author ── */}
                  <div className="min-w-0 flex items-center gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                    <p className="truncate text-[11px] font-medium text-zinc-300">
                      {authorName}
                    </p>
                  </div>

                  {/* ── Col 7: Date ── */}
                  <div className="min-w-0 text-[11px] text-zinc-500 tabular-nums">
                    {formatDate(commit.date)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
