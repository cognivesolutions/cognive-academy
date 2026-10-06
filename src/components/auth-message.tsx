"use client";

import { useEffect, useState } from "react";

type AuthMessageProps = {
  message?: string | null;
  durationMs?: number;
};

export function AuthMessage({ message, durationMs = 5000 }: AuthMessageProps) {
  const [isVisible, setIsVisible] = useState(Boolean(message));
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      setIsLeaving(false);
      return;
    }

    setIsVisible(true);
    setIsLeaving(false);
    const timeoutId = window.setTimeout(() => {
      setIsLeaving(true);
      window.setTimeout(() => setIsVisible(false), 500);
    }, durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [message, durationMs]);

  if (!message || !isVisible) {
    return null;
  }

  return (
    <div
      className={`mt-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50/95 px-3.5 py-2.5 text-sm font-medium text-red-700 shadow-sm shadow-red-100 ring-1 ring-red-100 transition-all duration-500 ease-out dark:border-red-500/50 dark:bg-red-500/10 dark:text-red-200 dark:shadow-red-950/20 dark:ring-red-500/20 ${
        isLeaving ? "translate-y-[-6px] scale-[0.995] opacity-0" : "translate-y-0 scale-100 opacity-100"
      }`}
    >
      <span className="inline-flex h-5 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
        ×
      </span>
      <span>{message}</span>
    </div>
  );
}
