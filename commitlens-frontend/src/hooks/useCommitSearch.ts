"use client";

import { useState, useCallback, useRef } from "react";
import { fetchCommits } from "@/lib/api";
import type { UnifiedParsedCommit } from "@/lib/types";

const PER_PAGE = 100;

interface UseCommitSearchResult {
  /** Cumulative pool of all fetched commits */
  commits: UnifiedParsedCommit[];
  totalCount: number;
  /** Current page index (1-based) that was last fetched */
  currentPage: number;
  hasMore: boolean;
  /** True while the very first (page=1) request is in-flight */
  loading: boolean;
  /** True while a "next page" request is in-flight */
  isFetchingMore: boolean;
  error: string | null;
  /** Trigger a brand-new search — resets pool, starts from page 1 */
  search: (owner: string, repo: string, query: string) => Promise<void>;
  /** Fetch the next page and append to pool */
  fetchMore: () => Promise<void>;
  reset: () => void;
}

export function useCommitSearch(): UseCommitSearchResult {
  const [commits, setCommits] = useState<UnifiedParsedCommit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep current search context in a ref so fetchMore can access it
  // without needing to be recreated on every render.
  const searchCtx = useRef<{ owner: string; repo: string; query: string } | null>(null);

  // ── Derived state ──────────────────────────────────────────────────────────
  const hasMore = commits.length < totalCount && totalCount > 0;

  // ── Initial Search (page 1) ────────────────────────────────────────────────
  const search = useCallback(
    async (owner: string, repo: string, query: string) => {
      if (!query.trim()) return;

      // Store context for subsequent fetchMore calls
      searchCtx.current = { owner, repo, query };

      setLoading(true);
      setError(null);
      setCommits([]);
      setTotalCount(0);
      setCurrentPage(0);

      try {
        const res = await fetchCommits(owner, repo, query, 1, PER_PAGE, "GITHUB");
        if (!res.success || !res.data) {
          setError(res.message ?? "Failed to search commits.");
        } else {
          setCommits(res.data.items ?? []);
          setTotalCount(Number(res.data.totalCount) || 0);
          setCurrentPage(1);
        }
      } catch {
        setError("Network error — could not reach the server.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Fetch Next Page (append to pool) ──────────────────────────────────────
  const fetchMore = useCallback(async () => {
    if (!searchCtx.current || isFetchingMore || loading) return;

    const { owner, repo, query } = searchCtx.current;
    const nextPage = currentPage + 1;

    setIsFetchingMore(true);
    setError(null);

    try {
      const res = await fetchCommits(owner, repo, query, nextPage, PER_PAGE, "GITHUB");
      if (!res.success || !res.data) {
        setError(res.message ?? "Failed to load more commits.");
      } else {
        setCommits((prev) => [...prev, ...(res.data!.items ?? [])]);
        setTotalCount(Number(res.data.totalCount) || 0);
        setCurrentPage(nextPage);
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setIsFetchingMore(false);
    }
  }, [currentPage, isFetchingMore, loading]);

  // ── Reset ──────────────────────────────────────────────────────────────────
  const reset = useCallback(() => {
    searchCtx.current = null;
    setCommits([]);
    setTotalCount(0);
    setCurrentPage(0);
    setError(null);
    setLoading(false);
    setIsFetchingMore(false);
  }, []);

  return {
    commits,
    totalCount,
    currentPage,
    hasMore,
    loading,
    isFetchingMore,
    error,
    search,
    fetchMore,
    reset,
  };
}
