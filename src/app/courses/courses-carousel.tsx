"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

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

export function CoursesCarousel({
  courses,
  purchasedCourseIds = new Set<string>(),
}: {
  courses: Course[];
  purchasedCourseIds?: Set<string>;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageCount = Math.max(0, courses.length - VISIBLE + 1);

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

  const scrollToPage = useCallback((page: number) => {
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

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextLeft = startLeft + (endLeft - startLeft) * (0.76 * eased);
      const fadeOpacity = 0.94 + (1 - 0.94) * eased;
      el.scrollLeft = nextLeft;
      el.style.opacity = String(fadeOpacity);
      el.style.filter = `saturate(${0.97 + 0.03 * eased}) blur(${0.28 * (1 - eased)}px)`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.scrollLeft = endLeft;
        el.style.opacity = "";
        el.style.filter = "";
      }
    };

    requestAnimationFrame(tick);
  }, [pageCount]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || courses.length <= 1) return;

    const timer = window.setInterval(() => {
      if (!el) return;

      const nextPage = currentPage + 1;
      const targetPage = nextPage >= pageCount ? 0 : nextPage;
      scrollToPage(targetPage);
    }, 5200);

    return () => {
      window.clearInterval(timer);
    };
  }, [courses.length, currentPage, pageCount, scrollToPage]);

  const scrollPrev = () => scrollToPage(currentPage - 1);
  const scrollNext = () => scrollToPage(currentPage + 1);

  const prevDisabled = pageCount <= 1 || currentPage <= 0;
  const nextDisabled = pageCount <= 1 || currentPage >= pageCount - 1;

  if (courses.length === 0) return null;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className="-mx-3 flex gap-6 overflow-x-auto px-3 pb-10 pr-8 scroll-smooth snap-x snap-mandatory touch-pan-x hide-scrollbar"
        role="list"
      >
        {courses.map((course) => {
          const isPurchased = purchasedCourseIds.has(course.id);
          const destination = isPurchased
            ? course.isLive
              ? `/courses/${course.slug}/live`
              : `/courses/${course.slug}/self-paced`
            : `/courses/${course.slug}`;

          return (
            <CourseCard
              key={course.id}
              course={course}
              statusLabel={course.isLive ? "Live" : "Recorded"}
              statusTone={course.isLive ? "live" : "recorded"}
              showFeaturedBadge={Boolean(course.featured)}
              action={
                <Link
                  href={destination}
                  onClick={(event) => {
                    event.preventDefault();
                    router.push(destination);
                  }}
                  className={`inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(13,148,136,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(13,148,136,0.36)] hover:ring-2 hover:ring-emerald-200/60 ${isPurchased ? "bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-500" : "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500"}`}
                >
                  {isPurchased ? "Continue learning" : "View course"}
                </Link>
              }
            />
          );
        })}
      </div>

      <PaginationDots
        currentPage={currentPage}
        totalPages={pageCount}
        showSinglePage={true}
        onPageChange={scrollToPage}
        onPrevious={() => !prevDisabled && scrollPrev()}
        onNext={() => !nextDisabled && scrollNext()}
      />
    </div>
  );
}
