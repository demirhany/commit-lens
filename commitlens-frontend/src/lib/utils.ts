// ─── Class name merger (inline — no external deps needed) ────────────────────
type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | Record<string, boolean | undefined | null>;

function clsxInner(val: ClassValue): string {
  if (!val) return "";
  if (typeof val === "string" || typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(clsxInner).filter(Boolean).join(" ");
  if (typeof val === "object") {
    return Object.entries(val)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k)
      .join(" ");
  }
  return "";
}

/** Merge class names safely (no Tailwind conflict resolution needed for this project's usage) */
export function cn(...inputs: ClassValue[]): string {
  return inputs.map(clsxInner).filter(Boolean).join(" ");
}

/** Format a date string or Instant (ISO) to a human readable relative label */
export function formatRelativeDate(iso?: string | null): string {
  if (!iso) return "Unknown date";
  try {
    const date = new Date(iso);
    if (isNaN(date.getTime())) return iso; // return raw if invalid

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch (e) {
    return iso;
  }
}

/** Short SHA — first 7 chars */
export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** Format a full ISO date for tooltip display */
export function formatFullDate(iso?: string | null): string {
  if (!iso) return "Unknown date";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return iso;
  }
}
