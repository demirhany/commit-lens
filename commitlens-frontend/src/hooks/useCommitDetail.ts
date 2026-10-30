"use client";

import { useState, useCallback } from "react";
import { fetchCommitDetail } from "@/lib/api";
import { formatApiError } from "@/lib/utils";
import type { GitProvider, UnifiedCommitDetail } from "@/lib/types";

interface UseCommitDetailResult {
  detail: UnifiedCommitDetail | null;
  loading: boolean;
  error: string | null;
  load: (owner: string, repo: string, sha: string, provider?: GitProvider, profileName?: string) => Promise<void>;
  clear: () => void;
}

export function useCommitDetail(): UseCommitDetailResult {
  const [detail, setDetail] = useState<UnifiedCommitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (owner: string, repo: string, sha: string, provider: GitProvider = "GITHUB", profileName?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchCommitDetail(owner, repo, sha, provider, profileName);
        if (!res.success || !res.data) {
          setError(formatApiError(res, "Failed to load commit details."));
        } else {
          setDetail(res.data);
        }
      } catch {
        setError("Network error — could not reach the server.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setDetail(null);
    setError(null);
    setLoading(false);
  }, []);

  return { detail, loading, error, load, clear };
}
