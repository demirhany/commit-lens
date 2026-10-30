"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GitCommitHorizontal,
  GitBranch,
  Ticket,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Git Analysis", href: "/workspace", icon: GitBranch },
  { label: "Jira Tracing", href: "/jira", icon: Ticket },
  { label: "Specifications", href: "/specifications", icon: ListChecks },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md transition-[width] duration-200",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Brand + toggle */}
      <div
        className={cn(
          "flex h-14 shrink-0 items-center border-b border-zinc-200 dark:border-zinc-800 px-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/30">
              <GitCommitHorizontal size={15} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              CommitLens
            </span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Links */}
      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
                collapsed && "justify-center px-0",
                active
                  ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 ring-1 ring-indigo-500/30"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
