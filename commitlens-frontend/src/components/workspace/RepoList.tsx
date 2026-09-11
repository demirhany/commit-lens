"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Search,
  GitBranch,
  Lock,
  Globe,
  RotateCcw,
  Plus,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RepoCardSkeleton } from "@/components/ui/Skeleton";
import type { UnifiedRepo } from "@/lib/types";
import { fetchRepo } from "@/lib/api";

interface RepoListProps {
  repos: UnifiedRepo[];
  loading: boolean;
  error: string | null;
  selectedRepo: UnifiedRepo | null;
  onSelect: (repo: UnifiedRepo) => void;
  onRetry: () => void;
}

// ─── Small sub-component: Add External Repo Panel ────────────────────────────
function AddExternalRepoPanel({
  onAdd,
  onCancel,
}: {
  onAdd: (repo: UnifiedRepo) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState("");
  const [validating, setValidating] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setFieldError("Please enter a repository in owner/repo format.");
      return;
    }

    const parts = trimmed.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      setFieldError('Use the format: owner/repo (e.g. "facebook/react")');
      return;
    }

    const [owner, repo] = parts;
    setValidating(true);
    setFieldError(null);

    try {
      const res = await fetchRepo(owner, repo, "GITHUB");
      if (!res.success || !res.data) {
        setFieldError(
          res.message ?? "Repository not found or private."
        );
      } else {
        onAdd(res.data);
      }
    } catch {
      setFieldError("Network error — could not reach the server.");
    } finally {
      setValidating(false);
    }
  }, [value, onAdd]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") onCancel();
  };

  return (
    <div className="mx-3 mb-2 rounded-lg border border-zinc-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 shadow-sm p-3 space-y-2.5 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
          External Repo
        </span>
        <button
          onClick={onCancel}
          className="flex h-5 w-5 items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Cancel"
        >
          <X size={12} />
        </button>
      </div>

      {/* Input */}
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setFieldError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="owner/repo"
          spellCheck={false}
          disabled={validating}
          className={cn(
            "w-full rounded-md border bg-zinc-50 dark:bg-zinc-950/60 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-zinc-200",
            "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
            "outline-none transition-colors",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            fieldError
              ? "border-rose-400 dark:border-rose-500/60 focus:border-rose-500"
              : "border-zinc-200 dark:border-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500"
          )}
        />
        {fieldError && (
          <p className="text-[11px] text-rose-500 dark:text-rose-400 leading-snug">
            {fieldError}
          </p>
        )}
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600">
          Public GitHub repos only · e.g. <span className="font-mono">electron/electron</span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={validating || !value.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-1.5 text-xs font-medium text-white dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {validating ? (
            <>
              <Loader2 size={11} className="animate-spin" />
              Validating…
            </>
          ) : (
            <>
              <ExternalLink size={11} />
              Add Repo
            </>
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={validating}
          className="rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RepoList({
  repos,
  loading,
  error,
  selectedRepo,
  onSelect,
  onRetry,
}: RepoListProps) {
  const [filter, setFilter] = useState("");
  const [showAddPanel, setShowAddPanel] = useState(false);
  // External repos added by the user (validated by backend)
  const [externalRepos, setExternalRepos] = useState<UnifiedRepo[]>([]);

  // Merge user repos + external repos, then filter by search string
  const allRepos = [...repos, ...externalRepos];
  const filtered = allRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.owner.toLowerCase().includes(filter.toLowerCase())
  );

  const handleAddExternal = useCallback(
    (repo: UnifiedRepo) => {
      // Avoid duplicates
      setExternalRepos((prev) => {
        if (prev.some((r) => r.id === repo.id)) return prev;
        return [...prev, repo];
      });
      setShowAddPanel(false);
      onSelect(repo);
    },
    [onSelect]
  );

  // IDs of external repos for badge rendering
  const externalIds = new Set(externalRepos.map((r) => r.id));

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 transition-colors">
      {/* Panel header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Repositories
          </h2>
          <div className="flex items-center gap-2">
            {!loading && allRepos.length > 0 && (
              <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                {allRepos.length}
              </span>
            )}
            {/* Add external repo button */}
            <button
              onClick={() => setShowAddPanel((v) => !v)}
              title="Add external public repo"
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded transition-all cursor-pointer",
                showAddPanel
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* Filter input */}
        <div className="relative flex items-center">
          <Search
            size={13}
            className="absolute left-2.5 text-zinc-400 dark:text-zinc-500"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter repos…"
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/60 py-1.5 pl-8 pr-3 text-xs text-zinc-900 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-300 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-950 shadow-xs"
          />
        </div>
      </div>

      {/* Repo list body */}
      <div className="flex-1 overflow-y-auto px-0 py-2 custom-scrollbar">
        {/* Add external panel (inline, below header) */}
        {showAddPanel && (
          <AddExternalRepoPanel
            onAdd={handleAddExternal}
            onCancel={() => setShowAddPanel(false)}
          />
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-2 px-3 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <RepoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
              <RotateCcw size={18} />
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-[200px]">{error}</p>
            <button
              onClick={onRetry}
              className="text-xs text-zinc-900 dark:text-zinc-200 underline underline-offset-2 hover:text-indigo-600 dark:hover:text-white transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty filter result */}
        {!loading && !error && filtered.length === 0 && allRepos.length > 0 && (
          <p className="py-8 text-center text-xs text-zinc-500">
            No repos match &ldquo;{filter}&rdquo;
          </p>
        )}

        {/* Repo items */}
        {!loading && !error && (
          <div className="space-y-1.5 px-3 pt-1">
            {filtered.map((repo) => {
              const isActive = selectedRepo?.id === repo.id;
              const isExternal = externalIds.has(repo.id);
              return (
                <button
                  key={repo.id}
                  onClick={() => onSelect(repo)}
                  className={cn(
                    "group w-full rounded-lg border px-3 py-2.5 text-left transition-all duration-150",
                    isActive
                      ? "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 shadow-xs"
                      : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                  )}
                >
                  {/* Repo name + visibility badge */}
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className={cn(
                        "truncate text-sm font-medium leading-tight",
                        isActive
                          ? "text-zinc-900 dark:text-zinc-100 font-semibold"
                          : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                      )}
                    >
                      {repo.name}
                    </span>
                    {isExternal ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        <Globe size={8} />
                        External
                      </span>
                    ) : (
                      <Badge variant={repo.isPrivate ? "private" : "public"}>
                        {repo.isPrivate ? (
                          <><Lock size={9} /> Private</>
                        ) : (
                          <><Globe size={9} /> Public</>
                        )}
                      </Badge>
                    )}
                  </div>

                  {/* Owner */}
                  <p className="mb-1.5 truncate text-[11px] text-zinc-500 dark:text-zinc-500">
                    {repo.owner}
                  </p>

                  {/* Default branch */}
                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 dark:text-zinc-500">
                    <GitBranch size={10} />
                    <span className="font-mono">{repo.defaultBranch}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
