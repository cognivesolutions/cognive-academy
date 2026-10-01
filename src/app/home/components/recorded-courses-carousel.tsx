"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { CourseCard, type CourseCardData } from "@/components/course-card";
import { PaginationDots } from "@/components/pagination-dots";

type Course = CourseCardData;

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
        {safeCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            statusLabel="Recorded"
            statusTone="recorded"
            showFeaturedBadge={false}
            action={
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
            }
          />
        ))}
      </div>

      {isHydrated ? (
        <PaginationDots
          currentPage={currentPage}
          totalPages={pageCount}
          showSinglePage={true}
          onPageChange={scrollToPage}
          onPrevious={() => !prevDisabled && scrollPrev()}
          onNext={() => !nextDisabled && scrollNext()}
        />
      ) : null}
    </div>
  );
}
