"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CourseSearchItem = {
  id: string;
  slug: string;
  title: string;
  category?: string | null;
  shortDescription?: string | null;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmed)})`, "ig"));

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={`${part}-${index}`} className="rounded bg-indigo-100 px-0.5 text-indigo-700">
        {part}
      </mark>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export function GlobalCourseSearch({ courses }: { courses: CourseSearchItem[] }) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return courses.filter((course) => {
      const searchable = [
        course.title,
        course.category ?? "",
        course.shortDescription ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(trimmed);
    });
  }, [courses, query]);

  return (
    <div className="relative hidden xl:block">
      <label className="relative block">
        <span className="sr-only">Search courses</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="6" />
          <path d="M16 16L21 21" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search courses"
          aria-label="Search courses"
          className="w-40 rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 transition-all duration-200 focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100"
        />
      </label>

      {query.trim() ? (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[70] w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="max-h-72 overflow-y-auto p-2">
            {matches.length > 0 ? (
              matches.slice(0, 6).map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  onClick={() => setQuery("")}
                  className="block rounded-xl px-3 py-2 transition hover:bg-slate-50"
                >
                  <div className="text-sm font-semibold text-slate-900">
                    {highlightMatch(course.title, query)}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {course.category ? highlightMatch(course.category, query) : "Course"}
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-sm text-slate-500">
                No matching course found.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
