"use client";

import { useState, useCallback } from "react";
import { fetchJiraIssueCommits } from "@/lib/api";
import type {
  UnifiedParsedCommit,
  JiraIssueCommitResponseDto,
  JiraCommitContext,
} from "@/lib/types";

interface UseJiraSearchResult {
  /** Full Jira issue response (issueKey, summary, totalCommits) */
  issueData: JiraIssueCommitResponseDto | null;
  /** Normalised commit list ready for CommitList */
  commits: UnifiedParsedCommit[];
  /** Per-SHA context map so CommitDetailModal can open with correct provider/owner/repo */
  contextMap: Map<string, JiraCommitContext>;
  loading: boolean;
  error: string | null;
  searchByKey: (issueKey: string, profileName?: string) => Promise<void>;
  reset: () => void;
}

export function useJiraSearch(): UseJiraSearchResult {
  const [issueData, setIssueData] = useState<JiraIssueCommitResponseDto | null>(null);
  const [commits, setCommits] = useState<UnifiedParsedCommit[]>([]);
  const [contextMap, setContextMap] = useState<Map<string, JiraCommitContext>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchByKey = useCallback(async (issueKey: string, profileName?: string) => {
    const key = issueKey.trim().toUpperCase();
    if (!key) return;

    setLoading(true);
    setError(null);
    setIssueData(null);
    setCommits([]);
    setContextMap(new Map());

    try {
      const data = await fetchJiraIssueCommits(key, profileName);

      // Build per-SHA context map for CommitDetailModal
      const map = new Map<string, JiraCommitContext>();
      const normalised: UnifiedParsedCommit[] = [];

      for (const jiraCommit of data.commits) {
        const sha = jiraCommit.commit.rawCommitDto.sha;
        map.set(sha, {
          owner: jiraCommit.owner,
          repo: jiraCommit.repo,
          repoName: jiraCommit.repoName,
          provider: jiraCommit.provider,
        });
        normalised.push(jiraCommit.commit);
      }

      setIssueData(data);
      setCommits(normalised);
      setContextMap(map);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Jira commit'leri yüklenirken bir hata oluştu.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIssueData(null);
    setCommits([]);
    setContextMap(new Map());
    setError(null);
    setLoading(false);
  }, []);

  return { issueData, commits, contextMap, loading, error, searchByKey, reset };
}
