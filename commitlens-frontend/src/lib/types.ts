// ─── API Envelope ────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message?: string | null;
  data?: T | null;
  details?: string[] | null;
  timestamp?: string | null;
}

// ─── Repository ───────────────────────────────────────────────────────────────
export interface UnifiedRepo {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  isPrivate: boolean;
  htmlUrl: string;
}

// ─── Commit (list item) ───────────────────────────────────────────────────────
export interface UnifiedRawCommit {
  sha: string;
  message?: string | null;
  authorName: string;
  authorEmail?: string | null;
  date?: string | null; // Instant serialised as ISO string
  htmlUrl?: string | null;
}

export interface UnifiedParsedCommit {
  rawCommitDto: UnifiedRawCommit;
  parsedMessage?: ParsedCommitMessage | null;
}

// ─── Commit search response ───────────────────────────────────────────────────
export interface UnifiedCommitSearchResponse {
  totalCount?: number | null;
  page: number;
  perPage: number;
  items: UnifiedParsedCommit[];
}

// ─── Parsed conventional commit message ──────────────────────────────────────
export interface ParsedCommitMessage {
  rawMessage: string;
  type?: string | null;
  scope?: string | null;
  description: string;
  isBreakingChange?: boolean | null;
  isConventional?: boolean | null;
  jiraKeys?: string[] | null;
}

// ─── File diff ────────────────────────────────────────────────────────────────
export interface UnifiedFileDiff {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
}

// ─── Commit detail ────────────────────────────────────────────────────────────
export interface UnifiedCommitDetail {
  parsedCommitDto: UnifiedParsedCommit;
  totalAdditions: number;
  totalDeletions: number;
  files: UnifiedFileDiff[];
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export type GitProvider = "GITHUB" | "BITBUCKET";

// ─── Jira Integration ─────────────────────────────────────────────────────────
export interface JiraCommitDto {
  provider: GitProvider;
  owner: string;
  repo: string;
  repoName?: string;
  commit: UnifiedParsedCommit;
}

export interface JiraIssueCommitResponseDto {
  issueKey: string;
  summary: string;
  totalCommits: number;
  commits: JiraCommitDto[];
}

/** Lightweight context stored per-SHA to open CommitDetailModal correctly */
export interface JiraCommitContext {
  owner: string;
  repo: string;
  repoName?: string;
  provider: GitProvider;
}
