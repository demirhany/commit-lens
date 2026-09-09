"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { GitCommitHorizontal, GitFork, Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UnifiedRepo } from "@/lib/types";

interface WorkspaceHeaderProps {
  selectedRepo: UnifiedRepo | null;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export function WorkspaceHeader({
  selectedRepo,
  onSearch,
  isSearching,
}: WorkspaceHeaderProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (selectedRepo) inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedRepo]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      onSearch(query.trim());
    }
  };

  const isDisabled = !selectedRepo;
  const placeholder = isDisabled
    ? "Select a repository to search commits..."
    : `Search in ${selectedRepo.name}… (Enter)`;

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800 bg-zinc-900/90 px-5 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/30">
          <GitCommitHorizontal size={15} className="text-indigo-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">
          CommitLens
        </span>
      </div>

      {/* Provider selector */}
      <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-1 shrink-0">
        {/* GitHub — active */}
        <button className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 transition-colors">
          <GitFork size={12} />
          GitHub
        </button>
        {/* Bitbucket — disabled */}
        <button
          disabled
          className="relative flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 cursor-not-allowed"
        >
          Bitbucket
          <span className="rounded-full bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-500">
            Soon
          </span>
        </button>
      </div>

      {/* Search bar — centred */}
      <div className="flex flex-1 justify-center px-4">
        <div
          className={cn(
            "relative flex w-full max-w-xl items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200",
            isDisabled
              ? "border-zinc-800/40 bg-zinc-950/30 cursor-not-allowed opacity-60"
              : "border-zinc-800 bg-zinc-950/80 focus-within:border-indigo-500/50 focus-within:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/20"
          )}
        >
          <Search
            size={15}
            className={cn(
              "shrink-0 transition-colors",
              isDisabled ? "text-zinc-600" : "text-zinc-400"
            )}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={isDisabled}
            suppressHydrationWarning
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-500",
              isDisabled
                ? "text-zinc-600 cursor-not-allowed"
                : "text-zinc-100"
            )}
          />
          {/* Keyboard hint */}
          {!isDisabled && !isSearching && (
            <div className="hidden items-center gap-1 sm:flex">
              <kbd className="flex h-5 items-center gap-0.5 rounded border border-zinc-800 bg-zinc-900 px-1.5 text-[10px] text-zinc-400">
                <Command size={9} />K
              </kbd>
            </div>
          )}
          {isSearching && (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-indigo-400" />
          )}
        </div>
      </div>
    </header>
  );
}
