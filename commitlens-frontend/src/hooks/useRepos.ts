"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchRepos } from "@/lib/api";
import type { UnifiedRepo } from "@/lib/types";

interface UseReposResult {
  repos: UnifiedRepo[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useRepos(): UseReposResult {
  const [repos, setRepos] = useState<UnifiedRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchRepos("GITHUB");
      if (!res.success || !res.data) {
        setError(res.message ?? "Failed to load repositories.");
      } else {
        setRepos(res.data);
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { repos, loading, error, refetch: load };
}
