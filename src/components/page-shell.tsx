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
    <main className={`min-h-screen bg-slate-950 text-white ${className}`}>
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            {description ? <p className="mt-3 text-slate-300">{description}</p> : null}
          </div>

          {action ?? (
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-200"
            >
              Back to Home
            </Link>
          )}
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.25)] sm:p-8">
          {children}
        </div>
      </div>
    </main>
  );
}
