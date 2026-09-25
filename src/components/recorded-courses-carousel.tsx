"use client"

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Course = any;

const VISIBLE = 3;

export default function RecordedCoursesCarousel({ courses }: { courses: Course[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [pageCount, setPageCount] = useState(Math.max(1, Math.ceil(courses.length / VISIBLE)));
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    setPageCount(Math.max(1, Math.ceil(courses.length / VISIBLE)));
  }, [courses.length]);

  const updateCurrentPage = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentPage(Math.max(0, Math.min(page, pageCount - 1)));
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
    if (!el) return;
    const target = Math.max(0, Math.min(page, pageCount - 1));
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
  };

  const scrollNext = () => scrollToPage(currentPage + 1);
  const scrollPrev = () => scrollToPage(currentPage - 1);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="-mx-3 flex gap-6 overflow-x-auto px-3 pb-10 scroll-smooth snap-x snap-mandatory touch-pan-x hide-scrollbar"
        role="list"
      >
        {courses.map((course) => (
          <article
            key={course.id}
            role="listitem"
            className="group flex-shrink-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-[0_18px_40px_rgba(99,102,241,0.12)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50 snap-center"
            style={{ flex: "0 0 calc((100% - 2rem) / 3)" }}
          >
            <div className="mb-4 h-40 w-full overflow-hidden rounded-xl bg-slate-100">
              {course.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={course.coverImage} alt={course.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-2 text-sm font-semibold text-indigo-600">Recorded</div>
              <h3 className="text-xl font-bold text-slate-900">{course.title}</h3>
              <p className="mt-3 text-sm text-slate-600 line-clamp-2">{course.shortDescription ?? course.description}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-bold text-slate-900">₹{Number(course.price).toLocaleString("en-IN")}</div>
              <Link href={`/courses/${course.slug}`} className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                View details
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* pagination dots and aligned arrows */}
      <div className="mt-4 relative">
        <div className="flex items-center justify-center">
          <div className="flex gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToPage(i)}
                aria-label={`Go to page ${i + 1}`}
                aria-current={i === currentPage}
                className={`h-2 w-2 rounded-full transition-all ${i === currentPage ? "bg-slate-900 w-3" : "bg-slate-300"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
              />
            ))}
          </div>
        </div>

        {/* bottom-right arrows aligned to center of dots */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 flex items-center gap-3">
          {(() => {
            const prevDisabled = currentPage <= 0;
            return (
              <button
                onClick={() => !prevDisabled && scrollPrev()}
                aria-label="Previous"
                aria-disabled={prevDisabled}
                disabled={prevDisabled}
                className={`inline-flex w-10 h-10 rounded-full bg-white/95 items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  prevDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:bg-white"
                }`}
              >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-700">
              <path fillRule="evenodd" d="M12.293 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L8.414 10l3.879 3.879a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
              </button>
            );
          })()}

          {(() => {
            const nextDisabled = currentPage >= pageCount - 1;
            return (
              <button
                onClick={() => !nextDisabled && scrollNext()}
                aria-label="Next"
                aria-disabled={nextDisabled}
                disabled={nextDisabled}
                className={`inline-flex w-10 h-10 rounded-full bg-white/95 items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  nextDisabled ? "opacity-40 cursor-not-allowed pointer-events-none" : "hover:bg-white"
                }`}
              >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-slate-700">
              <path fillRule="evenodd" d="M7.707 4.293a1 1 0 010 1.414L3.414 10l4.293 4.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z" clipRule="evenodd" transform="rotate(180 10 10)" />
            </svg>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
