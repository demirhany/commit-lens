"use client";

import { useEffect, useState, useCallback } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "error" | "success" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// ─── Singleton event bus ─────────────────────────────────────────────────────
type ToastListener = (toast: ToastMessage) => void;
const listeners: ToastListener[] = [];

export function toast(message: string, type: ToastType = "error") {
  const id = Math.random().toString(36).slice(2);
  listeners.forEach((l) => l({ id, type, message }));
}

// ─── Component ───────────────────────────────────────────────────────────────
const ICONS = {
  error: <AlertTriangle size={16} className="shrink-0 text-rose-400" />,
  success: <CheckCircle size={16} className="shrink-0 text-emerald-400" />,
  info: <Info size={16} className="shrink-0 text-sky-400" />,
};

const STYLES = {
  error: "border-rose-500/30 bg-zinc-900/95 text-zinc-100 shadow-2xl",
  success: "border-emerald-500/30 bg-zinc-900/95 text-zinc-100 shadow-2xl",
  info: "border-sky-500/30 bg-zinc-900/95 text-zinc-100 shadow-2xl",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const handler: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => dismiss(t.id), 5000);
    };
    listeners.push(handler);
    return () => {
      const idx = listeners.indexOf(handler);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [dismiss]);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl",
            "animate-in slide-in-from-bottom-2 fade-in duration-200",
            STYLES[t.type]
          )}
        >
          {ICONS[t.type]}
          <p className="flex-1 text-sm text-zinc-200 leading-snug">
            {t.message}
          </p>
          <button
            onClick={() => dismiss(t.id)}
            className="shrink-0 text-zinc-400 hover:text-zinc-100 transition-colors"
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
