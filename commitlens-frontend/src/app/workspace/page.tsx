"use client";

import { useState, useCallback, useEffect } from "react";
import { WorkspaceHeader } from "@/components/workspace/WorkspaceHeader";
import { RepoList } from "@/components/workspace/RepoList";
import { CommitList } from "@/components/workspace/CommitList";
import { CommitDetailModal } from "@/components/workspace/CommitDetailModal";
import { ToastContainer, toast } from "@/components/ui/Toast";
import { useRepos } from "@/hooks/useRepos";
import { useCommitSearch } from "@/hooks/useCommitSearch";
import type { UnifiedRepo } from "@/lib/types";

export default function WorkspacePage() {
  const { repos, loading: reposLoading, error: reposError, refetch } = useRepos();
  const { commits, totalCount, loading: searchLoading, error: searchError, search, reset } =
    useCommitSearch();

  const [selectedRepo, setSelectedRepo] = useState<UnifiedRepo | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSha, setActiveSha] = useState<string | null>(null);

  // Show repo errors as toast
  useEffect(() => {
    if (reposError) toast(reposError, "error");
  }, [reposError]);

  // Show search errors as toast
  useEffect(() => {
    if (searchError) toast(searchError, "error");
  }, [searchError]);

  const handleSelectRepo = useCallback(
    (repo: UnifiedRepo) => {
      setSelectedRepo(repo);
      reset();
      setHasSearched(false);
    },
    [reset]
  );

  const handleSearch = useCallback(
    async (query: string) => {
      if (!selectedRepo) return;
      setHasSearched(true);
      await search(selectedRepo.owner, selectedRepo.name, query);
    },
    [selectedRepo, search]
  );

  const handleCommitClick = useCallback((sha: string) => {
    setActiveSha(sha);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveSha(null);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-hidden transition-colors">
      {/* Top navigation / search bar */}
      <WorkspaceHeader
        selectedRepo={selectedRepo}
        onSearch={handleSearch}
        isSearching={searchLoading}
      />

      {/* Main content — 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — repo list */}
        <RepoList
          repos={repos}
          loading={reposLoading}
          error={reposError}
          selectedRepo={selectedRepo}
          onSelect={handleSelectRepo}
          onRetry={refetch}
        />

        {/* Right panel — commit results */}
        <main className="flex flex-1 flex-col overflow-hidden border-l border-zinc-200 dark:border-zinc-800/60">
          <CommitList
            commits={commits}
            totalCount={totalCount}
            loading={searchLoading}
            error={searchError}
            selectedRepo={selectedRepo}
            hasSearched={hasSearched}
            onCommitClick={handleCommitClick}
          />
        </main>
      </div>

      {/* Commit detail modal */}
      <CommitDetailModal
        sha={activeSha}
        repo={selectedRepo}
        onClose={handleModalClose}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}
