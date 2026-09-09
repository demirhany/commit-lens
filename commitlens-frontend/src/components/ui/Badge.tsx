import { cn } from "@/lib/utils";

// ─── Conventional commit type colours ────────────────────────────────────────
const COMMIT_TYPE_STYLES: Record<string, string> = {
  feat: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  fix: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  chore: "bg-zinc-800 text-zinc-400 border-zinc-700",
  docs: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  style: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  refactor: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  perf: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  test: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  build: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  ci: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  revert: "bg-red-500/15 text-red-400 border-red-500/30",
};

const VARIANT_STYLES = {
  default: "bg-zinc-800 text-zinc-300 border-zinc-700",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  error: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  jira: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30 font-mono",
  breaking: "bg-red-500/20 text-red-300 border-red-500/50",
  branch: "bg-zinc-800 text-zinc-400 border-zinc-700",
  private: "bg-amber-500/10 text-amber-400/80 border-amber-500/20",
  public: "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: keyof typeof VARIANT_STYLES;
  commitType?: string | null;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  commitType,
  className,
}: BadgeProps) {
  const style = commitType
    ? (COMMIT_TYPE_STYLES[commitType.toLowerCase()] ?? VARIANT_STYLES.default)
    : VARIANT_STYLES[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium tracking-wide",
        style,
        className
      )}
    >
      {children}
    </span>
  );
}
