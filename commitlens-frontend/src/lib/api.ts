import type {
  ApiResponse,
  GitProvider,
  UnifiedRepo,
  UnifiedCommitSearchResponse,
  UnifiedCommitDetail,
  JiraIssueCommitResponseDto,
} from "./types";
import { DEFAULT_PROFILE } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: init.method ?? "GET",
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    headers: { "Content-Type": "application/json" },
    // Next.js App Router: opt-out of static caching for dynamic data
    cache: "no-store",
  });

  // 204 No Content (e.g. DELETE) has no body
  if (res.status === 204) {
    return { success: true, status: 204 };
  }

  // Try to parse JSON regardless of status so we can extract the message
  let body: ApiResponse<T>;
  try {
    body = await res.json();
  } catch {
    body = {
      success: false,
      status: res.status,
      message: `Unexpected response from server (${res.status})`,
    };
  }

  // If the HTTP request failed but the server returned a non-envelope body,
  // normalise it into our ApiResponse shape.
  if (!res.ok && body.success === undefined) {
    body = {
      success: false,
      status: res.status,
      message: body.message ?? `Request failed with status ${res.status}`,
    };
  }

  return body;
}

/**
 * Returns a `&profileName=...` suffix, or an empty string when the profile is
 * unset or "DEFAULT" — the backend then applies its default rules.
 */
export function profileQuery(profileName?: string | null): string {
  if (!profileName || profileName === DEFAULT_PROFILE) return "";
  return `&profileName=${encodeURIComponent(profileName)}`;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /api/git-analysis/repos?provider={provider} */
export function fetchRepos(
  provider: GitProvider = "GITHUB"
): Promise<ApiResponse<UnifiedRepo[]>> {
  return apiFetch<UnifiedRepo[]>(
    `/api/git-analysis/repos?provider=${provider}`
  );
}

/** GET /api/git-analysis/repos/{owner}/{repo}?provider={provider} */
export function fetchRepo(
  owner: string,
  repo: string,
  provider: GitProvider = "GITHUB"
): Promise<ApiResponse<UnifiedRepo>> {
  return apiFetch<UnifiedRepo>(
    `/api/git-analysis/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}?provider=${provider}`
  );
}

/** GET /api/git-analysis/repos/{owner}/{repo}/commits?query={q}&page={page}&perPage={perPage}&provider={provider} */
export function fetchCommits(
  owner: string,
  repo: string,
  query: string,
  page = 1,
  perPage = 100,
  provider: GitProvider = "GITHUB",
  profileName?: string
): Promise<ApiResponse<UnifiedCommitSearchResponse>> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    perPage: String(perPage),
    provider,
  });
  return apiFetch<UnifiedCommitSearchResponse>(
    `/api/git-analysis/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params}${profileQuery(profileName)}`
  );
}

/** GET /api/git-analysis/repos/{owner}/{repo}/commits/{sha} */
export function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string,
  provider: GitProvider = "GITHUB",
  profileName?: string
): Promise<ApiResponse<UnifiedCommitDetail>> {
  return apiFetch<UnifiedCommitDetail>(
    `/api/git-analysis/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${sha}?provider=${provider}${profileQuery(profileName)}`
  );
}

/** GET /api/jira/issues/{issueKey}/commits */
export async function fetchJiraIssueCommits(
  issueKey: string,
  profileName?: string
): Promise<JiraIssueCommitResponseDto> {
  const res = await apiFetch<JiraIssueCommitResponseDto>(
    `/api/jira/issues/${encodeURIComponent(issueKey.trim().toUpperCase())}/commits${profileName && profileName !== DEFAULT_PROFILE ? `?profileName=${encodeURIComponent(profileName)}` : ""}`
  );

  if (!res.success || !res.data) {
    if (res.status === 404) {
      throw new Error(`"${issueKey.toUpperCase()}" Jira bileti bulunamadı.`);
    }
    throw new Error(
      res.details?.length
        ? `${res.message ?? "Hata"}: ${res.details.join(", ")}`
        : res.message ?? "Jira commit'leri yüklenirken bir sunucu hatası oluştu."
    );
  }

  return res.data;
}
