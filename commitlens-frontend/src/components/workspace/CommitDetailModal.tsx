"use client";

import { useEffect, useMemo } from "react";
import {
  ExternalLink,
  GitCommitHorizontal,
  User,
  Calendar,
  Plus,
  Minus,
  FileCode,
  AlertTriangle,
  Tag,
  AlignLeft,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatFullDate, shortSha } from "@/lib/utils";
import { useCommitDetail } from "@/hooks/useCommitDetail";
import { cn } from "@/lib/utils";
import type { UnifiedRepo } from "@/lib/types";

interface CommitDetailModalProps {
  sha: string | null;
  repo: UnifiedRepo | null;
  /** Active search query for body highlight */
  activeQuery: string;
  onClose: () => void;
}

const FILE_STATUS_STYLES: Record<string, string> = {
  added: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  modified: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  removed: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  renamed: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  copied: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  changed: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  unchanged: "text-zinc-400 bg-zinc-800/60 border-zinc-700/50",
};

// ─── Helper: split rawMessage into title line + body ──────────────────────────
function splitRawMessage(raw?: string | null): {
  title: string;
  body: string | null;
} {
  if (!raw) return { title: "", body: null };
  const newline = raw.indexOf("\n");
  if (newline === -1) return { title: raw, body: null };
  const title = raw.slice(0, newline).trim();
  const body = raw.slice(newline + 1).trimEnd();
  return { title, body: body.length > 0 ? body : null };
}

// ─── Helper: highlight query occurrences inside a plain-text string ───────────
// Returns an array of React-renderable nodes (strings and <mark> spans).
function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}): React.ReactNode {
  if (!query) return <>{text}</>;

  const q = query.toLowerCase();
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const idx = text.toLowerCase().indexOf(q, cursor);
    if (idx === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark
        key={idx}
        className="bg-yellow-400/25 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 px-0.5 rounded not-italic"
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    cursor = idx + q.length;
  }

  return <>{parts}</>;
}

export function CommitDetailModal({
  sha,
  repo,
  activeQuery,
  onClose,
}: CommitDetailModalProps) {
  const { detail, loading, error, load, clear } = useCommitDetail();

  useEffect(() => {
    if (sha && repo) {
      load(repo.owner, repo.name, sha);
    } else {
      clear();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sha, repo]);

  const handleClose = () => {
    clear();
    onClose();
  };

  const parsedCommit = detail?.parsedCommitDto;
  const pm = parsedCommit?.parsedMessage;
  const raw = parsedCommit?.rawCommitDto;
  const isConventional = pm?.isConventional ?? false;
  const isBreaking = pm?.isBreakingChange ?? false;
  const type = pm?.type?.toLowerCase() || "raw";
  const scope = pm?.scope || null;
  const jiraKeys = pm?.jiraKeys ?? [];
  const files = detail?.files ?? [];
  const displayDescription =
    pm?.description ||
    pm?.rawMessage ||
    raw?.message ||
    (raw ? shortSha(raw.sha) : "");
  const authorName = raw?.authorName || "Unknown Author";

  // ── Parse message body ──────────────────────────────────────────────────────
  // We split off the title (first line) and keep the body (remaining lines).
  const { body: rawBody } = useMemo(
    () => splitRawMessage(raw?.message),
    [raw?.message]
  );

  const modalTitle = (
    <div className="flex items-start gap-3 min-w-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/30">
        <GitCommitHorizontal size={16} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className="min-w-0">
        {loading || (!detail && sha) ? (
          <Skeleton className="h-5 w-48 mb-1" />
        ) : (
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            {isConventional && type !== "raw" && (
              <Badge commitType={type}>{type}</Badge>
            )}
            {isBreaking && (
              <Badge variant="breaking">
                <AlertTriangle size={10} />
                BREAKING
              </Badge>
            )}
            {scope && (
              <span className="text-xs text-zinc-600 dark:text-zinc-400">({scope})</span>
            )}
            <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
              {raw ? shortSha(raw.sha) : ""}
            </code>
          </div>
        )}
        {loading || (!detail && sha) ? (
          <Skeleton className="h-4 w-72" />
        ) : (
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
            {displayDescription}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <Modal open={!!sha} onClose={handleClose} title={modalTitle} size="xl">
      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-400">
          <AlertTriangle size={15} />
          {error}
        </div>
      )}

      {/* Loading content */}
      {loading && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-20 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-1/3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        </div>
      )}

      {/* Fallback state when !detail and !loading and !error */}
      {!detail && !loading && !error && sha && (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6 text-sm text-zinc-500 dark:text-zinc-400 justify-center">
          No commit details available
        </div>
      )}

      {/* Detail content */}
      {detail && !loading && (
        <div className="space-y-6">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <User size={12} className="text-zinc-400 dark:text-zinc-500" />
              <span className="text-zinc-800 dark:text-zinc-200 font-medium">{authorName}</span>
              {raw?.authorEmail && (
                <span className="text-zinc-400 dark:text-zinc-500">&lt;{raw.authorEmail}&gt;</span>
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-zinc-400 dark:text-zinc-500" />
              {formatFullDate(raw?.date)}
            </span>
            {raw?.htmlUrl && (
              <a
                href={raw.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <ExternalLink size={11} />
                View on GitHub
              </a>
            )}
          </div>

          {/* Jira keys */}
          {jiraKeys.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Tag size={12} className="text-zinc-400 dark:text-zinc-500" />
              {jiraKeys.map((key) => (
                <Badge key={key} variant="jira">
                  {key}
                </Badge>
              ))}
            </div>
          )}

          {/* ── Commit Body (rawMessage) ──────────────────────────────────── */}
          {rawBody && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <AlignLeft size={13} className="text-zinc-400 dark:text-zinc-500" />
                <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Commit Body
                </h4>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 p-3 rounded-lg overflow-x-auto custom-scrollbar">
                <HighlightedText text={rawBody} query={activeQuery} />
              </pre>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <Plus size={16} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400/70 font-medium">Additions</p>
                <p className="text-xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400">
                  +{detail.totalAdditions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15">
                <Minus size={16} className="text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-rose-700 dark:text-rose-400/70 font-medium">Deletions</p>
                <p className="text-xl font-bold tabular-nums text-rose-700 dark:text-rose-400">
                  -{detail.totalDeletions}
                </p>
              </div>
            </div>
          </div>

          {/* Changed files */}
          {files.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileCode size={13} className="text-zinc-400 dark:text-zinc-500" />
                <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Changed Files
                </h4>
                <span className="rounded-full bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400">
                  {files.length}
                </span>
              </div>

              <div className="space-y-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/80 p-3">
                {files.map((file, idx) => {
                  const statusStyle =
                    FILE_STATUS_STYLES[file.status.toLowerCase()] ??
                    FILE_STATUS_STYLES.unchanged;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-zinc-200/60 dark:hover:bg-zinc-900"
                    >
                      {/* Status badge */}
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                          statusStyle
                        )}
                      >
                        {file.status}
                      </span>

                      {/* Filename */}
                      <span className="flex-1 truncate font-mono text-[11px] text-zinc-800 dark:text-zinc-300">
                        {file.filename}
                      </span>

                      {/* Add/del counts */}
                      <div className="flex shrink-0 items-center gap-2 text-[11px] tabular-nums">
                        {file.additions > 0 && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            +{file.additions}
                          </span>
                        )}
                        {file.deletions > 0 && (
                          <span className="text-rose-600 dark:text-rose-400 font-medium">
                            -{file.deletions}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
