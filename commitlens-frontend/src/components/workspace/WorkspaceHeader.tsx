"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { GitCommitHorizontal, GitFork, Search, Command, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/ThemeContext";
import type { UnifiedRepo } from "@/lib/types";

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
  onSearchModeChange: (mode: SearchMode) => void;
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
  onSearchModeChange,
}: WorkspaceHeaderProps) {
  const [githubQuery, setGithubQuery] = useState("");
  const [jiraQuery, setJiraQuery] = useState("");
  const githubInputRef = useRef<HTMLInputElement>(null);
  const jiraInputRef = useRef<HTMLInputElement>(null);
  const { theme, toggleTheme } = useTheme();

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
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-5 backdrop-blur-md transition-colors">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/30">
          <GitCommitHorizontal size={15} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          CommitLens
        </span>
      </div>

      {/* ── Mode selector ── */}
      <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-950/60 p-1 shrink-0">
        {/* GitHub mode */}
        <button
          onClick={() => onSearchModeChange("github")}
          title="Search commits inside a GitHub repository"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
            searchMode === "github"
              ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          <GitFork size={12} />
          GitHub
          <span className="ml-0.5 rounded bg-zinc-100 dark:bg-zinc-700/80 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-500 dark:text-zinc-400">
            Max 1K
          </span>
        </button>

        {/* Jira mode */}
        <button
          onClick={() => onSearchModeChange("jira")}
          title="GitHub ve Bitbucket bağlantılı Jira biletlerini analiz eder — tek bilet altındaki tüm repo commit'lerini görüntüleyin"
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150 cursor-pointer",
            searchMode === "jira"
              ? "bg-indigo-500 text-white shadow-xs"
              : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
          )}
        >
          {/* Row 1: J mark + label */}
          <span className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex h-3.5 w-3.5 items-center justify-center rounded text-[9px] font-black leading-none",
                searchMode === "jira"
                  ? "bg-white/20 text-white"
                  : "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
              )}
            >
              J
            </span>
            Jira
          </span>
          {/* Row 2: provider mini-tags — always visible */}
          <span className="flex items-center gap-0.5">
            <span
              className={cn(
                "rounded px-1 py-px text-[8px] font-semibold leading-none",
                searchMode === "jira"
                  ? "bg-white/20 text-white"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
              )}
            >
              GH
            </span>
            <span
              className={cn(
                "rounded px-1 py-px text-[8px] font-semibold leading-none",
                searchMode === "jira"
                  ? "bg-blue-400/30 text-blue-100"
                  : "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
              )}
            >
              BB
            </span>
          </span>
        </button>
      </div>

      {/* ── Search bar — centred ── */}
      <div className="flex flex-1 justify-center px-4">
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
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs shrink-0 cursor-pointer"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={16} className="text-amber-400 transition-transform duration-200 hover:rotate-12" />
        ) : (
          <Moon size={16} className="text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    </header>
  );
}
