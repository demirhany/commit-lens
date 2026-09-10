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
// NOTE: backend updated — root `message` removed; parsed data comes via parsedMessage
export interface UnifiedRawCommit {
  sha: string;
  parsedMessage?: ParsedCommitMessage | null;
  authorName: string;
  authorEmail?: string | null;
  date?: string | null; // Instant serialised as ISO string
  htmlUrl?: string | null;
}

// ─── Commit search response ───────────────────────────────────────────────────
export interface UnifiedCommitSearchResponse {
  totalCount: number;
  page: number;
  perPage: number;
  items: UnifiedRawCommit[];
}

// ─── Parsed conventional commit message ──────────────────────────────────────
export interface ParsedCommitMessage {
  rawMessage?: string | null;
  type?: string | null;
  scope?: string | null;
  description?: string | null;
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
  sha: string;
  htmlUrl?: string | null;
  authorName: string;
  authorEmail?: string | null;
  date?: string | null;
  parsedMessage?: ParsedCommitMessage | null;
  totalAdditions: number;
  totalDeletions: number;
  files: UnifiedFileDiff[];
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export type GitProvider = "GITHUB" | "BITBUCKET";
