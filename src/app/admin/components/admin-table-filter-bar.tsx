import Link from "next/link";
import type { ReactNode } from "react";

type AdminTableFilterBarProps = {
  hasActiveFilters?: boolean;
  clearFiltersHref?: string;
  clearFiltersLabel?: string;
  leftControls?: ReactNode;
  rightControls?: ReactNode;
};

export function AdminTableFilterBar({
  hasActiveFilters = false,
  clearFiltersHref,
  clearFiltersLabel = "Remove filter",
  leftControls,
  rightControls,
}: AdminTableFilterBarProps) {
  return (
    <div className="mb-4 space-y-2">
      <div className="flex w-full flex-nowrap items-center justify-between gap-2 overflow-visible rounded-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
        <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2 overflow-visible">
          {hasActiveFilters && clearFiltersHref ? (
            <Link
              href={clearFiltersHref}
              scroll={false}
              className="inline-flex h-[38px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-0 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
            >
              {clearFiltersLabel}
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.04)] opacity-70 transition duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            >
              {clearFiltersLabel}
            </button>
          )}

          {leftControls}
        </div>

        {rightControls ? <div className="ml-auto flex-shrink-0">{rightControls}</div> : null}
      </div>
    </div>
  );
}
