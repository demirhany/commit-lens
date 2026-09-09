import { X } from "lucide-react";

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  filters: ActiveFilter[];
  onClearAll: () => void;
  totalCount: number;
  filteredCount: number;
  hasConventionalCommits: boolean;
}

export function FilterChips({
  filters,
  onClearAll,
  totalCount,
  filteredCount,
  hasConventionalCommits,
}: FilterChipsProps) {
  return (
    <div className="flex items-center gap-3 border-b border-white/5 bg-zinc-900/30 px-4 py-2 text-xs">
      <span className="text-zinc-500 shrink-0">
        Showing{" "}
        <span className="font-semibold text-zinc-300">{filteredCount}</span>
        {totalCount > filteredCount && (
          <>
            {" "}of{" "}
            <span className="font-semibold text-zinc-300">{totalCount}</span>
          </>
        )}{" "}
        commits
      </span>

      {filters.length > 0 ? (
        <>
          <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {filters.map((filter) => (
              <div
                key={filter.key}
                className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 pl-2 pr-1 py-0.5 text-[11px] font-medium text-indigo-300"
              >
                <span>{filter.label}</span>
                <button
                  onClick={filter.onRemove}
                  className="rounded-full p-0.5 transition-colors hover:bg-indigo-500/20 hover:text-indigo-200"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            Clear all filters
          </button>
        </>
      ) : (
        hasConventionalCommits && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] text-zinc-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
            conventional
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-700 ml-1" />
            non-conventional
          </span>
        )
      )}
    </div>
  );
}
