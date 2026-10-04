"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CourseRecord = {
  id: string;
  title: string;
  category: string | null;
  accessGranted: boolean;
};

export function StudentRecordsList({ courses }: { courses: CourseRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        (course.category ?? "").toLowerCase().includes(normalizedQuery) ||
        (course.accessGranted ? "active" : "pending").includes(normalizedQuery);

      const matchesStatus = status === "all" || (status === "active" ? course.accessGranted : !course.accessGranted);

      return matchesQuery && matchesStatus;
    });
  }, [courses, query, status]);

  const hasFilters = Boolean(query || status !== "all");

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-nowrap items-center justify-between gap-2 overflow-visible rounded-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.10),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
        <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2 overflow-visible">
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setStatus("all");
              }}
              className="inline-flex h-[38px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-0 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
            >
              Remove filter
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex h-[38px] cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-0 text-sm font-semibold text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.04)] opacity-70 transition duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
            >
              Remove filter
            </button>
          )}

          <div className="min-w-[120px]">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-[38px] min-h-[38px] w-[120px] rounded-full border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="ml-auto flex-shrink-0">
          <div className="flex h-[38px] min-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-transparent px-3 py-0 text-[0.92rem] text-slate-900 shadow-none transition duration-200 focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-100 dark:focus-within:bg-slate-950/50">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-400"
            >
              <circle cx="8.5" cy="8.5" r="5" stroke="currentColor" strokeWidth="1.7" />
              <path d="M12.8 12.8L17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Type to search..."
              className="w-full border-0 bg-transparent text-[0.92rem] text-slate-900 placeholder:text-slate-500 outline-none dark:text-slate-100 dark:placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          No courses match your search.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="rounded-[22px] border border-slate-200 bg-slate-50 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.03)] transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-[0_14px_28px_rgba(99,102,241,0.08)] dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-indigo-500/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-bold text-slate-900 dark:text-white">{course.title}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">{course.category ?? "General"}</div>
                </div>
                <span
                  className={[
                    "rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                    course.accessGranted
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200",
                  ].join(" ")}
                >
                  {course.accessGranted ? "Active" : "Pending"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {course.accessGranted ? "Course access enabled" : "Awaiting access"}
                </div>
                <Link
                  href={`/admin/courses?query=${encodeURIComponent(course.title)}`}
                  className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] transition hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
                >
                  View course
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
