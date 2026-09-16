"use client";

import { GitCommitHorizontal } from "lucide-react";

interface JiraIssueHeaderProps {
  issueKey: string;
  summary: string;
  totalCommits: number;
}

export function JiraIssueHeader({ issueKey, summary, totalCommits }: JiraIssueHeaderProps) {
  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-indigo-200 dark:border-indigo-500/20 bg-indigo-50/60 dark:bg-indigo-500/8 px-5 py-3">
      {/* Jira icon */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-500/30">
        {/* Jira "J" wordmark */}
        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 select-none">J</span>
      </div>

      {/* Issue info */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          {/* Issue key badge */}
          <span className="inline-flex items-center rounded-md border border-indigo-300 dark:border-indigo-500/30 bg-indigo-100 dark:bg-indigo-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 shrink-0">
            {issueKey}
          </span>
          {/* Commit count pill */}
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-indigo-900/20 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-300">
            <GitCommitHorizontal size={11} />
            {totalCommits} commit
          </span>
        </div>
        <p
          title={summary}
          className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-snug"
        >
          {summary}
        </p>
      </div>
    </div>
  );
}
