"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CourseCard } from "@/components/course-card";
import { PaginationDots } from "@/components/pagination-dots";

type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  description: string | null;
  category: string | null;
  level: string | null;
  price: number | string | null;
  currency: string | null;
  featured: boolean | null;
  imageUrl: string | null;
  instructorName: string | null;
  durationHours: number | null;
  isLive: boolean;
  language: string | null;
  createdAt: Date | string | null;
  modules?: Array<{
    lectures?: Array<{
      durationSeconds?: number | null;
    } | null> | null;
  } | null>;
};

const normalizeLanguage = (value?: string | null) => {
  const raw = (value ?? "").trim().toLowerCase();
  if (!raw) return "en";
  if (raw.startsWith("hi")) return "hi";
  return "en";
};

export default function CategoryResultControls({
  liveCourses,
  recordedCourses,
  pageSize,
  currentPage,
  totalPages,
}: {
  liveCourses: CourseSummary[];
  recordedCourses: CourseSummary[];
  pageSize: number;
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const requestedType = searchParams.get("type") === "recorded" ? "recorded" : "live";
  const requestedLang = searchParams.get("lang") === "hi" ? "hi" : "en";

  const updateQuery = (nextType: string, nextLang: string, nextPage = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", nextType);
    params.set("lang", nextLang);
    params.set("page", String(nextPage));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const visibleCourses = (requestedType === "recorded" ? recordedCourses : liveCourses).filter((course) => {
    const language = normalizeLanguage(course.language ?? null);
    return requestedLang === "hi" ? language === "hi" : language === "en";
  });

  const safeCurrentPage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const currentResultPage = Math.min(safeCurrentPage, totalPages);
  const paginatedCourses = visibleCourses.slice((currentResultPage - 1) * pageSize, currentResultPage * pageSize);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", requestedType);
    params.set("lang", requestedLang);
    params.set("page", String(nextPage));
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const tabs = [
    { label: "Live", value: "live" },
    { label: "Recorded", value: "recorded" },
  ];

  const languageTabs = [
    { label: "English", value: "en" },
    { label: "Hindi", value: "hi" },
  ];

  return (
    <section className="mt-8 rounded-[28px] border border-slate-200/80 bg-white/70 p-3 shadow-[0_16px_44px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/55">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const active = tab.value === requestedType;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => updateQuery(tab.value, requestedLang, 1)}
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ease-out ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] ring-2 ring-indigo-200/50 dark:ring-indigo-500/35"
                    : "bg-white/70 text-slate-600 hover:text-slate-900 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/85 p-1 backdrop-blur-sm dark:bg-slate-900/70">
          {languageTabs.map((option) => {
            const active = requestedLang === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateQuery(requestedType, option.value, 1)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ease-out ${
                  active
                    ? "bg-white/80 text-slate-900 shadow-[0_8px_22px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/80 backdrop-blur-md dark:bg-slate-800/80 dark:text-white dark:shadow-[0_10px_26px_rgba(15,23,42,0.42)] dark:ring-slate-700/90"
                    : "text-slate-600 hover:-translate-y-0.5 hover:bg-white/70 hover:text-slate-900 hover:shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:ring-1 hover:ring-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white dark:hover:shadow-[0_8px_22px_rgba(15,23,42,0.3)] dark:hover:ring-slate-700/70"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibleCourses.length === 0 ? (
        <div className="mt-8 rounded-[26px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
          No {requestedType} courses available in this track yet.
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {paginatedCourses.map((course) => {
              const detailHref = course.isLive ? `/courses/${course.slug}/live` : `/courses/${course.slug}`;

              return (
                <CourseCard
                  key={course.id}
                  course={{
                    id: course.id,
                    slug: course.slug,
                    title: course.title,
                    shortDescription: course.shortDescription,
                    description: course.description,
                    category: course.category,
                    level: course.level,
                    price: course.price,
                    featured: course.featured,
                    imageUrl: course.imageUrl,
                    isLive: course.isLive,
                    language: course.language,
                    durationHours: course.durationHours,
                    modules: course.modules,
                  }}
                  statusLabel={course.isLive ? "Live" : "Recorded"}
                  statusTone={course.isLive ? "live" : "recorded"}
                  showFeaturedBadge={Boolean(course.featured)}
                  action={
                    <Link
                      href={detailHref}
                      onClick={(event) => {
                        event.preventDefault();
                        router.push(detailHref);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.32)] hover:ring-2 hover:ring-indigo-200/60"
                    >
                      View course
                    </Link>
                  }
                />
              );
            })}
          </div>

          <div className="mt-8 pb-1">
            <PaginationDots
              className="mt-2 flex items-center justify-center gap-2 pt-1"
              currentPage={currentResultPage - 1}
              totalPages={totalPages}
              showSinglePage={true}
              onPageChange={(page) => {
                const nextPage = page + 1;
                router.replace(buildPageHref(nextPage), { scroll: false });
              }}
              onPrevious={() => {
                if (currentResultPage > 1) {
                  router.replace(buildPageHref(currentResultPage - 1), { scroll: false });
                }
              }}
              onNext={() => {
                if (currentResultPage < totalPages) {
                  router.replace(buildPageHref(currentResultPage + 1), { scroll: false });
                }
              }}
            />
          </div>
        </>
      )}
    </section>
  );
}
