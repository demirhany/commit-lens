import { useRef } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

interface ColumnFilterPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}

export function ColumnFilterPopover({
  isOpen,
  onClose,
  children,
  className,
  align = "left",
}: ColumnFilterPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useClickOutside(popoverRef, () => {
    if (isOpen) onClose();
  });

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={cn(
        "absolute top-full mt-2 w-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 shadow-xl shadow-zinc-900/10 dark:shadow-black/60 z-50 text-zinc-900 dark:text-zinc-100",
        align === "right" ? "right-0" : "left-0",
        "animate-in fade-in zoom-in-95 duration-150 cursor-default",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );
}
