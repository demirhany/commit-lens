import type {
  ApiResponse,
  GitProvider,
  UnifiedRepo,
  UnifiedCommitSearchResponse,
  UnifiedCommitDetail,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

// ─── Generic fetch wrapper ────────────────────────────────────────────────────
async function apiFetch<T>(path: string): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    // Next.js App Router: opt-out of static caching for dynamic data
    cache: "no-store",
  });

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

// ─── Endpoints ────────────────────────────────────────────────────────────────

/** GET /api/git-analysis/repos?provider={provider} */
export function fetchRepos(
  provider: GitProvider = "GITHUB"
): Promise<ApiResponse<UnifiedRepo[]>> {
  return apiFetch<UnifiedRepo[]>(
    `/api/git-analysis/repos?provider=${provider}`
  );
}

/** GET /api/git-analysis/repos/{owner}/{repo}/commits?query={q}&page={page}&perPage={perPage}&provider={provider} */
export function fetchCommits(
  owner: string,
  repo: string,
  query: string,
  page = 1,
  perPage = 100,
  provider: GitProvider = "GITHUB"
): Promise<ApiResponse<UnifiedCommitSearchResponse>> {
  const params = new URLSearchParams({
    query,
    page: String(page),
    perPage: String(perPage),
    provider,
  });
  return apiFetch<UnifiedCommitSearchResponse>(
    `/api/git-analysis/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params}`
  );
}

/** GET /api/git-analysis/repos/{owner}/{repo}/commits/{sha} */
export function fetchCommitDetail(
  owner: string,
  repo: string,
  sha: string,
  provider: GitProvider = "GITHUB"
): Promise<ApiResponse<UnifiedCommitDetail>> {
  return apiFetch<UnifiedCommitDetail>(
    `/api/git-analysis/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${sha}?provider=${provider}`
  );
}
