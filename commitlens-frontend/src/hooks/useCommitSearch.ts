"use client";

import { useState, useCallback } from "react";
import { fetchCommits } from "@/lib/api";
import type { UnifiedRawCommit } from "@/lib/types";

interface UseCommitSearchResult {
  commits: UnifiedRawCommit[];
  totalCount: number;
  loading: boolean;
  error: string | null;
  search: (owner: string, repo: string, query: string) => Promise<void>;
  reset: () => void;
}

export function useCommitSearch(): UseCommitSearchResult {
  const [commits, setCommits] = useState<UnifiedRawCommit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (owner: string, repo: string, query: string) => {
      if (!query.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCommits(owner, repo, query, 100, "GITHUB");
        if (!res.success || !res.data) {
          setError(res.message ?? "Failed to search commits.");
          setCommits([]);
        } else {
          setCommits(res.data.items);
          setTotalCount(res.data.totalCount);
        }
      } catch {
        setError("Network error — could not reach the server.");
        setCommits([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setCommits([]);
    setTotalCount(0);
    setError(null);
    setLoading(false);
  }, []);

  return { commits, totalCount, loading, error, search, reset };
}
