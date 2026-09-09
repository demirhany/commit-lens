"use client";

import { useState } from "react";
import { Search, GitBranch, Lock, Globe, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { RepoCardSkeleton } from "@/components/ui/Skeleton";
import type { UnifiedRepo } from "@/lib/types";

interface RepoListProps {
  repos: UnifiedRepo[];
  loading: boolean;
  error: string | null;
  selectedRepo: UnifiedRepo | null;
  onSelect: (repo: UnifiedRepo) => void;
  onRetry: () => void;
}

export function RepoList({
  repos,
  loading,
  error,
  selectedRepo,
  onSelect,
  onRetry,
}: RepoListProps) {
  const [filter, setFilter] = useState("");

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(filter.toLowerCase()) ||
      r.owner.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="flex w-[320px] shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40 transition-colors">
      {/* Panel header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Repositories
          </h2>
          {!loading && repos.length > 0 && (
            <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
              {repos.length}
            </span>
          )}
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
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-2 pt-1">
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
        {!loading && !error && filtered.length === 0 && repos.length > 0 && (
          <p className="py-8 text-center text-xs text-zinc-500">
            No repos match &ldquo;{filter}&rdquo;
          </p>
        )}

        {/* Repo items */}
        {!loading && !error && (
          <div className="space-y-1.5 pt-1">
            {filtered.map((repo) => {
              const isActive = selectedRepo?.id === repo.id;
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
                  <div className="flex items-center gap-2 mb-1">
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
                    <Badge variant={repo.isPrivate ? "private" : "public"}>
                      {repo.isPrivate ? (
                        <><Lock size={9} /> Private</>
                      ) : (
                        <><Globe size={9} /> Public</>
                      )}
                    </Badge>
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
