"use client";
import Link from "next/link";
import React from "react";

export default function BackButton({ href = -1 as unknown as string | number, className }: { href?: string | number; className?: string }) {
  const baseClass =
    "inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200";

  const mergedClass = (className ? `${className} ` : "") + baseClass;

  // if href is -1 (default), go back in history
  if (typeof href === "number" && href === -1) {
    return (
      <button type="button" onClick={() => window.history.back()} className={mergedClass} aria-label="Go back">
        <span aria-hidden>←</span>
        <span>Back</span>
      </button>
    );
  }

  return (
    <Link href={String(href)} className={mergedClass} aria-label="Go back">
      <span aria-hidden>←</span>
      <span>Back</span>
    </Link>
  );
}
