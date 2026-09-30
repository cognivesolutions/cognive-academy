"use client"

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

export default function LiveCoursesCarousel({ courses }: { courses: Course[] }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const safeCourses = Array.isArray(courses) ? courses : [];
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.max(0, safeCourses.length - VISIBLE + 1);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setCurrentPage((previous) => Math.min(previous, Math.max(0, pageCount - 1)));
  }, [pageCount]);

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

    const firstCard = el.querySelector("article");
    const gap = 24;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;

    if (cardWidth <= 0) {
      setCurrentPage(0);
      return;
    }

    const nextPage = Math.round(el.scrollLeft / cardWidth);
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

  const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

  const scrollToPage = (page: number) => {
    const el = containerRef.current;
    if (!el || pageCount <= 1) return;

    const firstCard = el.querySelector("article");
    const gap = 24;
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
    const target = Math.max(0, Math.min(page, pageCount - 1));
    const startLeft = el.scrollLeft;
    const reducedCardWidth = cardWidth > 0 ? Math.max(0, cardWidth - 30) : 0;
    const endLeft = reducedCardWidth > 0 ? target * reducedCardWidth : 0;
    const duration = 900;
    const startTime = performance.now();

    const tick = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextLeft = startLeft + (endLeft - startLeft) * (0.72 * eased);
      const fadeOpacity = 0.96 + (1 - 0.96) * eased;
      el.scrollLeft = nextLeft;
      el.style.opacity = String(fadeOpacity);
      el.style.filter = `saturate(${0.98 + 0.02 * eased}) blur(${0.2 * (1 - eased)}px)`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.scrollLeft = endLeft;
        el.style.opacity = "";
        el.style.filter = "";
        setCurrentPage(target);
      }
    };

    requestAnimationFrame(tick);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el || safeCourses.length <= 1) return;

    const timer = window.setInterval(() => {
      if (!el) return;

      const nextPage = currentPage + 1;
      const targetPage = nextPage >= pageCount ? 0 : nextPage;
      scrollToPage(targetPage);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentPage, pageCount, safeCourses.length]);

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
              className="group flex h-full min-h-[580px] flex-shrink-0 snap-center flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(248,250,252,0.96))] p-4 shadow-[0_20px_48px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-2 hover:border-indigo-200/80 hover:shadow-[0_30px_68px_rgba(79,70,229,0.18),0_20px_44px_rgba(15,23,42,0.08)] hover:ring-2 hover:ring-indigo-200/60 dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(17,24,39,0.98))] dark:shadow-[0_24px_52px_rgba(15,23,42,0.36)] dark:hover:border-indigo-500/40 dark:hover:shadow-[0_32px_70px_rgba(79,70,229,0.2),0_18px_40px_rgba(15,23,42,0.18)] dark:hover:ring-indigo-500/35"
              style={{ flex: "0 0 calc((100% - 2rem) / 3)" }}
            >
              <div className="flex h-full flex-col">
                <div className="relative mb-4 overflow-hidden rounded-[22px] bg-slate-100 ring-1 ring-slate-200 transition-all duration-300 group-hover:ring-indigo-200/60 dark:bg-slate-800 dark:ring-slate-700 dark:group-hover:ring-indigo-500/40">
                  {(() => {
                    const DEFAULT_IMG = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";
                    const src = imgSrc ?? DEFAULT_IMG;
                    return (
                      <>
                        <img
                          src={src}
                          alt={course.title}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            if (target.src !== DEFAULT_IMG) target.src = DEFAULT_IMG;
                          }}
                          className="block h-52 w-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:brightness-[1.02]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
                      </>
                    );
                  })()}

                  <div className="absolute left-3 top-3">
                    <span className="rounded-full border border-white/20 bg-white/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-200">
                      {formatCategory(course.category)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.17em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
                      Live
                    </span>

                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{course.level || "Beginner"}</span>
                  </div>

                  <h2 className="mt-3 min-h-[66px] text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">{course.title}</h2>
                  <p className="mt-2 min-h-[82px] flex-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                    {course.shortDescription ?? course.description}
                  </p>

                  <div className="mt-2 flex min-h-[26px] flex-wrap items-center gap-1 text-[10px] leading-none text-slate-600 dark:text-slate-300">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-[2px] dark:border-slate-700 dark:bg-slate-800">{course.durationHours ?? 0} hrs</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-1.5 py-[2px] dark:border-slate-700 dark:bg-slate-800">{course.instructorName || "Expert-led"}</span>
                  </div>

                  <div className="mt-auto pt-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Price</div>
                          <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">₹{Number(course.price).toLocaleString("en-IN")}</div>
                        </div>

                        <Link
                          href={`/courses/${course.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            router.push(`/courses/${course.slug}`);
                          }}
                          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)] hover:ring-2 hover:ring-indigo-200/60"
                        >
                          View course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {isHydrated ? (
        <div className="-mt-2 flex items-center justify-center gap-3 pb-2">
          <button
            onClick={() => !prevDisabled && scrollPrev()}
            aria-label="Previous"
            aria-disabled={prevDisabled}
            disabled={prevDisabled}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800/90 dark:shadow-[0_8px_24px_rgba(15,23,42,0.45)] ${
              prevDisabled ? "pointer-events-none cursor-not-allowed opacity-40" : "hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-700 dark:text-slate-200">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          {pageCount > 1 ? (
            <div className="flex items-center gap-2">
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
          ) : null}

          <button
            onClick={() => !nextDisabled && scrollNext()}
            aria-label="Next"
            aria-disabled={nextDisabled}
            disabled={nextDisabled}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800/90 dark:shadow-[0_8px_24px_rgba(15,23,42,0.45)] ${
              nextDisabled ? "pointer-events-none cursor-not-allowed opacity-40" : "hover:bg-white dark:hover:bg-slate-700"
            }`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-slate-700 dark:text-slate-200">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      ) : null}
    </div>
  );
}
