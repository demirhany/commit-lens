"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { ScopePolicy, SpecificationResponse } from "@/lib/types";

const POLICY_VARIANT: Record<ScopePolicy, "success" | "warning" | "default"> = {
  OPTIONAL: "success",
  REQUIRED: "warning",
  DISABLED: "default",
};

interface SpecificationCardProps {
  spec: SpecificationResponse;
  onEdit: (spec: SpecificationResponse) => void;
  onDelete: (spec: SpecificationResponse) => void;
}

export function SpecificationCard({ spec, onEdit, onDelete }: SpecificationCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-4 shadow-xs transition-colors hover:border-indigo-500/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {spec.profileName}
          </h3>
          <p className="mt-1 line-clamp-2 min-h-8 text-xs text-zinc-500 dark:text-zinc-400">
            {spec.description || "No description"}
          </p>
        </div>
        <Badge variant={POLICY_VARIANT[spec.scopePolicy]}>{spec.scopePolicy}</Badge>
      </div>

      <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
        <Badge variant="info">{spec.types.length} types</Badge>
        <Badge variant="default">{spec.scopes.length} scopes</Badge>
      </div>

      <div className="flex justify-end gap-1 border-t border-zinc-200 dark:border-zinc-800 pt-3">
        <button
          onClick={() => onEdit(spec)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          onClick={() => onDelete(spec)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}
