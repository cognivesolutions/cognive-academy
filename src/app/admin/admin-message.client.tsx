"use client";

import { useEffect, useState } from "react";

export function AdminMessage({ message, type }: { message: string; type: "success" | "error" }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [message, type]);

  if (!visible || !message) return null;

  return (
    <div
      className={type === "success"
        ? "mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
        : "mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200"}
    >
      {message}
    </div>
  );
}
