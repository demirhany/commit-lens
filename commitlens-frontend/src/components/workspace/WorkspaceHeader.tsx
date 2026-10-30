"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ProfileSelector } from "@/components/workspace/ProfileSelector";
import type { SpecificationResponse, UnifiedRepo } from "@/lib/types";

export type SearchMode = "github" | "jira";

interface WorkspaceHeaderProps {
  selectedRepo: UnifiedRepo | null;
  onSearch: (query: string) => void;
  isSearching: boolean;
  /** Called when user submits a Jira issue key */
  onJiraSearch: (issueKey: string) => void;
  isJiraSearching: boolean;
  /** Controlled mode — lifted to parent so mode survives re-renders */
  searchMode: SearchMode;
  /** Specification profiles shown in the dropdown next to the search box */
  profiles: SpecificationResponse[];
  profilesLoading?: boolean;
  selectedProfile: string;
  onProfileChange: (profileName: string) => void;
}

// Simple Jira key regex: one or more uppercase letters, dash, one or more digits
const JIRA_KEY_RE = /^[A-Z][A-Z0-9]+-\d+$/;

export function WorkspaceHeader({
  selectedRepo,
  onSearch,
  isSearching,
  onJiraSearch,
  isJiraSearching,
  searchMode,
  profiles,
  profilesLoading,
  selectedProfile,
  onProfileChange,
}: WorkspaceHeaderProps) {
  const [githubQuery, setGithubQuery] = useState("");
  const [jiraQuery, setJiraQuery] = useState("");
  const githubInputRef = useRef<HTMLInputElement>(null);
  const jiraInputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchMode === "github" && selectedRepo) {
          githubInputRef.current?.focus();
        } else if (searchMode === "jira") {
          jiraInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [searchMode, selectedRepo]);

  const handleGithubKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && githubQuery.trim()) {
      onSearch(githubQuery.trim());
    }
  };

  const handleJiraKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const key = jiraQuery.trim().toUpperCase();
      if (key) onJiraSearch(key);
    }
  };

  const isGithubDisabled = searchMode === "github" && !selectedRepo;
  const githubPlaceholder = isGithubDisabled
    ? "Select a repository to search commits..."
    : selectedRepo
    ? `Search in ${selectedRepo.name}… (Enter)`
    : "Search commits… (Enter)";

  const isSearchBusy = searchMode === "github" ? isSearching : isJiraSearching;

  // Jira input: warn if the format looks wrong (after at least 2 chars)
  const jiraFormatOk =
    jiraQuery.length < 2 || JIRA_KEY_RE.test(jiraQuery.trim().toUpperCase());

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-5 backdrop-blur-md z-30 transition-colors">
      {/* ── Search bar — centred ── */}
      <div className="flex flex-1 items-center justify-center gap-3 px-4">
        {searchMode === "github" ? (
          /* GitHub search input */
          <div
            className={cn(
              "relative flex w-full max-w-xl items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200",
              isGithubDisabled
                ? "border-zinc-200 dark:border-zinc-800/40 bg-zinc-100/50 dark:bg-zinc-950/30 cursor-not-allowed opacity-60"
                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 focus-within:border-indigo-500/50 focus-within:bg-white dark:focus-within:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xs"
            )}
          >
            <Search
              size={15}
              className={cn(
                "shrink-0 transition-colors",
                isGithubDisabled ? "text-zinc-400 dark:text-zinc-600" : "text-zinc-400"
              )}
            />
            <input
              ref={githubInputRef}
              type="text"
              value={githubQuery}
              disabled={isGithubDisabled}
              suppressHydrationWarning
              onChange={(e) => setGithubQuery(e.target.value)}
              onKeyDown={handleGithubKeyDown}
              placeholder={githubPlaceholder}
              className={cn(
                "flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500",
                isGithubDisabled
                  ? "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  : "text-zinc-900 dark:text-zinc-100"
              )}
            />
            {!isGithubDisabled && !isSearching && (
              <div className="hidden items-center gap-1 sm:flex">
                <kbd className="flex h-5 items-center gap-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
                  <Command size={9} />K
                </kbd>
              </div>
            )}
            {isSearching && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 dark:border-zinc-600 border-t-indigo-500 dark:border-t-indigo-400" />
            )}
          </div>
        ) : (
          /* Jira issue key input */
          <div
            className={cn(
              "relative flex w-full max-w-xl items-center gap-3 rounded-xl border px-3 py-2 transition-all duration-200",
              "border-indigo-300 dark:border-indigo-500/40 bg-white dark:bg-zinc-950/80",
              "focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xs",
              !jiraFormatOk && "border-amber-400 dark:border-amber-500/60 focus-within:ring-amber-500/20"
            )}
          >
            {/* Jira "J" icon */}
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-indigo-100 dark:bg-indigo-500/20 text-[11px] font-black text-indigo-600 dark:text-indigo-400 select-none">
              J
            </span>
            <input
              ref={jiraInputRef}
              type="text"
              value={jiraQuery}
              suppressHydrationWarning
              onChange={(e) => setJiraQuery(e.target.value.toUpperCase())}
              onKeyDown={handleJiraKeyDown}
              placeholder="Jira bilet kodu girin (örn: KAN-4, PROJ-123) ve Enter'a basın"
              className="flex-1 bg-transparent text-sm font-mono outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-zinc-900 dark:text-zinc-100 placeholder:font-sans"
            />
            {/* Format hint */}
            {jiraQuery.length > 0 && !jiraFormatOk && (
              <span className="shrink-0 text-[10px] text-amber-600 dark:text-amber-400 whitespace-nowrap">
                Geçersiz format
              </span>
            )}
            {/* Spinner or Cmd+K hint */}
            {isJiraSearching ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-300 dark:border-indigo-700 border-t-indigo-500 dark:border-t-indigo-400 shrink-0" />
            ) : (
              !isSearchBusy && (
                <div className="hidden items-center gap-1 sm:flex shrink-0">
                  <kbd className="flex h-5 items-center gap-0.5 rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-900/40 px-1.5 text-[10px] text-indigo-500 dark:text-indigo-400">
                    <Command size={9} />K
                  </kbd>
                </div>
              )
            )}
          </div>
        )}
        <ProfileSelector
          profiles={profiles}
          loading={profilesLoading}
          value={selectedProfile}
          onChange={onProfileChange}
        />
      </div>

      {/* Theme Toggle Button */}
      <ThemeToggle />
    </header>
  );
}
