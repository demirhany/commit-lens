"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={theme === "dark" ? "Switch to Light mode" : "Switch to Dark mode"}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-xs shrink-0 cursor-pointer",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={16} className="text-amber-400 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Moon size={16} className="text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
