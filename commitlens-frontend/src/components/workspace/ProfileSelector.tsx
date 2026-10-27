"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/hooks/useClickOutside";
import { DEFAULT_PROFILE, type SpecificationResponse } from "@/lib/types";

interface ProfileSelectorProps {
  profiles: SpecificationResponse[];
  loading?: boolean;
  /** Selected profileName, or DEFAULT_PROFILE */
  value: string;
  onChange: (profileName: string) => void;
  className?: string;
}

const DEFAULT_LABEL = "Default (Standard Conventional)";

export function ProfileSelector({
  profiles,
  loading,
  value,
  onChange,
  className,
}: ProfileSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const options = [
    { value: DEFAULT_PROFILE, label: DEFAULT_LABEL },
    ...profiles.map((p) => ({ value: p.profileName, label: p.profileName })),
  ];
  const current = options.find((o) => o.value === value) ?? {
    value,
    label: value === DEFAULT_PROFILE ? DEFAULT_LABEL : value,
  };

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        title="Commit specification profile"
        className="flex h-[38px] w-56 items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 px-3 text-sm text-zinc-700 dark:text-zinc-200 shadow-xs transition-colors hover:border-indigo-500/50 cursor-pointer"
      >
        <Layers size={14} className="shrink-0 text-indigo-500" />
        <span className="flex-1 truncate text-left">
          {loading && profiles.length === 0 && value === DEFAULT_PROFILE
            ? "Loading…"
            : current.label}
        </span>
        <ChevronDown
          size={14}
          className={cn("shrink-0 text-zinc-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-40 mt-1 max-h-56 w-64 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-1 shadow-xl custom-scrollbar"
        >
          {options.map((o) => {
            const selected = o.value === current.value;
            return (
              <li key={o.value} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors cursor-pointer",
                    selected
                      ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  )}
                >
                  <span className="flex-1 truncate">{o.label}</span>
                  {selected && <Check size={14} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
