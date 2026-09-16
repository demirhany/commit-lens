"use client";

import { useState, useCallback, useEffect } from "react";
import { WorkspaceHeader, SearchMode } from "@/components/workspace/WorkspaceHeader";
import { RepoList } from "@/components/workspace/RepoList";
import { CommitList } from "@/components/workspace/CommitList";
import { CommitDetailModal } from "@/components/workspace/CommitDetailModal";
import { JiraIssueHeader } from "@/components/workspace/JiraIssueHeader";
import { ToastContainer, toast } from "@/components/ui/Toast";
import { useRepos } from "@/hooks/useRepos";
import { useCommitSearch } from "@/hooks/useCommitSearch";
import { useJiraSearch } from "@/hooks/useJiraSearch";
import type { GitProvider, JiraCommitContext, UnifiedRepo } from "@/lib/types";

/** Derive sha → provider string map from the full JiraCommitContext map */
function buildProviderMap(ctx: Map<string, JiraCommitContext>): Map<string, string> {
  const pm = new Map<string, string>();
  ctx.forEach((val, sha) => pm.set(sha, val.provider));
  return pm;
}

export default function WorkspacePage() {
  // ── GitHub mode ──────────────────────────────────────────────────────────────
  const { repos, loading: reposLoading, error: reposError, refetch } = useRepos();
  const {
    commits: githubCommits,
    totalCount,
    hasMore,
    loading: searchLoading,
    isFetchingMore,
    error: searchError,
    search,
    fetchMore,
    reset: resetGithub,
  } = useCommitSearch();

  // ── Jira mode ─────────────────────────────────────────────────────────────────
  const {
    issueData,
    commits: jiraCommits,
    contextMap: jiraContextMap,
    loading: jiraLoading,
    error: jiraError,
    searchByKey,
    reset: resetJira,
  } = useJiraSearch();

  // ── Shared UI state ───────────────────────────────────────────────────────────
  const [searchMode, setSearchMode] = useState<SearchMode>("github");
  const [selectedRepo, setSelectedRepo] = useState<UnifiedRepo | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");

  // ── Commit detail modal state ─────────────────────────────────────────────────
  const [activeSha, setActiveSha] = useState<string | null>(null);
  /** Jira mode: context resolved from contextMap for the active SHA */
  const [activeJiraContext, setActiveJiraContext] =
    useState<JiraCommitContext | null>(null);

  // ── Active commits (unified) ──────────────────────────────────────────────────
  const activeCommits = searchMode === "jira" ? jiraCommits : githubCommits;
  const activeLoading = searchMode === "jira" ? jiraLoading : searchLoading;
  const activeError = searchMode === "jira" ? jiraError : searchError;

  // ── Toast on errors ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (reposError) toast(reposError, "error");
  }, [reposError]);

  useEffect(() => {
    if (searchError) toast(searchError, "error");
  }, [searchError]);

  useEffect(() => {
    if (jiraError) toast(jiraError, "error");
  }, [jiraError]);

  // ── Mode switch ───────────────────────────────────────────────────────────────
  const handleSearchModeChange = useCallback(
    (mode: SearchMode) => {
      setSearchMode(mode);
      setHasSearched(false);
      setActiveQuery("");
      setActiveSha(null);
      setActiveJiraContext(null);
      if (mode === "github") resetJira();
      else resetGithub();
    },
    [resetGithub, resetJira]
  );

  // ── GitHub handlers ───────────────────────────────────────────────────────────
  const handleSelectRepo = useCallback(
    (repo: UnifiedRepo) => {
      setSelectedRepo(repo);
      resetGithub();
      setHasSearched(false);
      setActiveQuery("");
    },
    [resetGithub]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!selectedRepo) return;
      setHasSearched(true);
      setActiveQuery(query.trim());
      await search(selectedRepo.owner, selectedRepo.name, query);
    },
    [selectedRepo, search]
  );

  // ── Jira handler ──────────────────────────────────────────────────────────────
  const handleJiraSearch = useCallback(
    async (issueKey: string) => {
      setHasSearched(true);
      setActiveQuery("");
      await searchByKey(issueKey);
    },
    [searchByKey]
  );

  // ── Commit click ──────────────────────────────────────────────────────────────
  const handleCommitClick = useCallback(
    (sha: string) => {
      setActiveSha(sha);
      if (searchMode === "jira") {
        setActiveJiraContext(jiraContextMap.get(sha) ?? null);
      } else {
        setActiveJiraContext(null);
      }
    },
    [searchMode, jiraContextMap]
  );

  const handleModalClose = useCallback(() => {
    setActiveSha(null);
    setActiveJiraContext(null);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors">
      {/* Top navigation / search bar */}
      <WorkspaceHeader
        selectedRepo={selectedRepo}
        onSearch={handleSearch}
        isSearching={searchLoading}
        onJiraSearch={handleJiraSearch}
        isJiraSearching={jiraLoading}
        searchMode={searchMode}
        onSearchModeChange={handleSearchModeChange}
      />

      {/* Main content — 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — repo list (hidden in Jira mode) */}
        {searchMode === "github" && (
          <RepoList
            repos={repos}
            loading={reposLoading}
            error={reposError}
            selectedRepo={selectedRepo}
            onSelect={handleSelectRepo}
            onRetry={refetch}
          />
        )}

        {/* Right panel — commit results */}
        <main className="flex flex-1 flex-col overflow-hidden border-l border-zinc-200 dark:border-zinc-800/60">
          {/* Jira issue header card */}
          {searchMode === "jira" && issueData && (
            <JiraIssueHeader
              issueKey={issueData.issueKey}
              summary={issueData.summary}
              totalCommits={issueData.totalCommits}
            />
          )}

          <CommitList
            commits={activeCommits}
            totalCount={searchMode === "jira" ? jiraCommits.length : totalCount}
            hasMore={searchMode === "jira" ? false : hasMore}
            isFetchingMore={searchMode === "jira" ? false : isFetchingMore}
            onFetchMore={searchMode === "jira" ? () => {} : fetchMore}
            loading={activeLoading}
            error={activeError}
            selectedRepo={selectedRepo}
            hasSearched={hasSearched}
            activeQuery={activeQuery}
            onCommitClick={handleCommitClick}
            isJiraMode={searchMode === "jira"}
            providerMap={searchMode === "jira" ? buildProviderMap(jiraContextMap) : undefined}
            jiraContextMap={searchMode === "jira" ? jiraContextMap : undefined}
          />
        </main>
      </div>

      {/* Commit detail modal */}
      {searchMode === "jira" && activeJiraContext ? (
        <CommitDetailModal
          sha={activeSha}
          repo={null}
          owner={activeJiraContext.owner}
          repoName={activeJiraContext.repo}
          provider={activeJiraContext.provider as GitProvider}
          activeQuery={activeQuery}
          onClose={handleModalClose}
        />
      ) : (
        <CommitDetailModal
          sha={activeSha}
          repo={selectedRepo}
          activeQuery={activeQuery}
          onClose={handleModalClose}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
