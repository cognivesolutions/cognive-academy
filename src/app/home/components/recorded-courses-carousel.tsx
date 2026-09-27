"use client"

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Course = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  price?: number | string | null;
  featured?: boolean | null;
  imageUrl?: string | null;
  coverImage?: string | null;
  isLive?: boolean | null;
  instructorName?: string | null;
  durationHours?: number | null;
  language?: string | null;
};

const VISIBLE = 3;

const formatCategory = (value?: string | null) => {
  const raw = value?.trim();
  if (!raw) return "General";

  const normalized = raw.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  const key = normalized.toLowerCase();

  const overrides: Record<string, string> = {
    "powr bi": "Power BI",
    "power bi": "Power BI",
    python: "Python",
    sql: "SQL",
    excel: "Excel",
    react: "React",
    django: "Django",
    git: "Git",
    mysql: "MySQL",
  };

  if (overrides[key]) return overrides[key];

  return normalized
    .split(" ")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ""))
    .join(" ");
};

export default function RecordedCoursesCarousel({ courses }: { courses: Course[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const safeCourses = Array.isArray(courses) ? courses : [];
  const [isHydrated, setIsHydrated] = useState(false);
  const [pageCount, setPageCount] = useState(Math.max(0, Math.ceil(safeCourses.length / VISIBLE)));
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const nextPageCount = Math.max(0, Math.ceil(safeCourses.length / VISIBLE));
    setPageCount(nextPageCount);
    setCurrentPage((previous) => Math.min(previous, Math.max(0, nextPageCount - 1)));
  }, [safeCourses.length]);

  const updateCurrentPage = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      setCurrentPage(0);
      return;
    }

    if (pageCount <= 1) {
      setCurrentPage(0);
      return;
    }

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    if (maxScroll <= 0) {
      setCurrentPage(0);
      return;
    }

    const nextPage = Math.round((el.scrollLeft / maxScroll) * (pageCount - 1));
    setCurrentPage(Math.max(0, Math.min(nextPage, pageCount - 1)));
  }, [pageCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => updateCurrentPage());
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    updateCurrentPage();

    const onResize = () => updateCurrentPage();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateCurrentPage]);

  const scrollToPage = (page: number) => {
    const el = containerRef.current;
    if (!el || pageCount <= 1) return;

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const target = Math.max(0, Math.min(page, pageCount - 1));
    const nextScrollLeft = maxScroll > 0 ? (maxScroll / (pageCount - 1)) * target : 0;
    el.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
  };

  const scrollNext = () => scrollToPage(currentPage + 1);
  const scrollPrev = () => scrollToPage(currentPage - 1);

  const prevDisabled = pageCount <= 1 || currentPage <= 0;
  const nextDisabled = pageCount <= 1 || currentPage >= pageCount - 1;

  return (
    <div className="relative" suppressHydrationWarning>
      <div
        ref={containerRef}
        className="-mx-3 flex gap-6 overflow-x-auto px-3 pb-10 pr-8 scroll-smooth snap-x snap-mandatory touch-pan-x hide-scrollbar"
        role="list"
      >
        {safeCourses.map((course) => {
          const imgSrc = course.coverImage ?? course.imageUrl ?? undefined;

          return (
          <article
            key={course.id}
            role="listitem"
            className="group flex flex-shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200/80 hover:shadow-[0_28px_60px_rgba(99,102,241,0.15),0_18px_40px_rgba(15,23,42,0.08)] hover:ring-2 hover:ring-indigo-200/60 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_20px_42px_rgba(15,23,42,0.3)] dark:hover:border-indigo-500/40 dark:hover:shadow-[0_26px_52px_rgba(99,102,241,0.18),0_18px_36px_rgba(15,23,42,0.22)] dark:hover:ring-indigo-500/35"
            style={{ flex: "0 0 calc((100% - 2rem) / 3)" }}
          >
            <div className="mb-4 overflow-hidden rounded-[20px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 group-hover:ring-indigo-200/60 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:ring-indigo-500/40">
              {(() => {
                const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
                const src = imgSrc ?? DEFAULT_IMG;
                return (
                  <img
                    src={src}
                    alt={course.title}
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (target.src !== DEFAULT_IMG) target.src = DEFAULT_IMG;
                    }}
                    className="h-48 w-full object-cover block transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-[1.02]"
                  />
                );
              })()}
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {formatCategory(course.category)}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Recorded
                </span>
              </div>
            </div>

            <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-white">{course.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {course.shortDescription ?? course.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.level || "Beginner"}</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.durationHours ?? 0} hrs</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 dark:border-slate-700 dark:bg-slate-800">{course.instructorName || "Expert-led"}</span>
            </div>

            <div className="mt-auto pt-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Price</div>
                  <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                    ₹{Number(course.price).toLocaleString("en-IN")}
                  </div>
                </div>

                <Link
                  href={`/courses/${course.slug}`}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)] hover:ring-2 hover:ring-indigo-200/60"
                >
                  View course
                </Link>
              </div>
            </div>
          </article>
          );
        })}
      </div>

      {isHydrated ? (
        <div className="mt-4 relative">
          {pageCount > 1 ? (
            <div className="flex items-center justify-center">
              <div className="flex gap-2">
                {Array.from({ length: pageCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToPage(i)}
                    aria-label={`Go to page ${i + 1}`}
                    aria-current={i === currentPage}
                    className={`h-2.5 rounded-full transition-all ${i === currentPage ? "w-5 bg-slate-900 dark:bg-white" : "w-2.5 bg-slate-300 dark:bg-slate-600"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <div className="absolute right-2 md:right-4 top-1/2 z-30 flex -translate-y-1/2 items-center gap-3">
            <button
              onClick={() => !prevDisabled && scrollPrev()}
              aria-label="Previous"
              aria-disabled={prevDisabled}
              disabled={prevDisabled}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800/90 dark:shadow-[0_8px_24px_rgba(15,23,42,0.45)] ${
                prevDisabled ? "pointer-events-none cursor-not-allowed opacity-40" : "hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-700 dark:text-slate-200">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={() => !nextDisabled && scrollNext()}
              aria-label="Next"
              aria-disabled={nextDisabled}
              disabled={nextDisabled}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800/90 dark:shadow-[0_8px_24px_rgba(15,23,42,0.45)] ${
                nextDisabled ? "pointer-events-none cursor-not-allowed opacity-40" : "hover:bg-white dark:hover:bg-slate-700"
              }`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-700 dark:text-slate-200">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
