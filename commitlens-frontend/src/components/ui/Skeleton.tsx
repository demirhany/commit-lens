import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-800/60",
        className
      )}
    />
  );
}

/** A full repo-card shaped skeleton */
export function RepoCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-zinc-800/60 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 flex-1" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** A table-row shaped skeleton for the high-density commit table */
export function CommitRowSkeleton() {
  return (
    <div className="grid grid-cols-[140px_80px_1fr_120px_80px_120px] items-center gap-4 border-b border-white/5 px-4 py-2.5">
      <Skeleton className="h-5 w-24 rounded-full" />
      <Skeleton className="h-4 w-14 rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="h-4 w-14 rounded font-mono" />
      <Skeleton className="h-4 w-24 rounded" />
    </div>
  );
}

/** @deprecated use CommitRowSkeleton for the data table */
export function CommitCardSkeleton() {
  return <CommitRowSkeleton />;
}
