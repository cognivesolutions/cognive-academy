import Link from "next/link";
import type { ReactNode } from "react";

type PageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function PageShell({
  eyebrow,
  title,
  description,
  action,
  children,
  className = "",
}: PageShellProps) {
  return (
    <main className={`min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_30%,_#f8fafc_100%)] text-slate-900 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,_#020817_0%,_#0f172a_32%,_#111827_100%)] dark:text-slate-50 ${className}`}>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              {title}
            </h1>
            {description ? <p className="mt-3 text-slate-600 dark:text-slate-300">{description}</p> : null}
          </div>

          {action ?? (
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-colors hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:shadow-[0_10px_24px_rgba(2,6,23,0.28)] dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
            >
              Back to Home
            </Link>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.25)]">
          {children}
        </div>
      </div>
    </main>
  );
}
