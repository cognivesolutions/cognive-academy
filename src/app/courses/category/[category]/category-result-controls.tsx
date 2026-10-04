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
  offerPrice?: number | string | null;
  isPromotional?: boolean | null;
  currency: string | null;
  featured: boolean | null;
  isNew: boolean | null;
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
  purchasedCourseIds = new Set<string>(),
}: {
  liveCourses: CourseSummary[];
  recordedCourses: CourseSummary[];
  pageSize: number;
  currentPage: number;
  totalPages: number;
  purchasedCourseIds?: Set<string>;
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

  const liveVisibleCourses = liveCourses.filter((course) => {
    const language = normalizeLanguage(course.language ?? null);
    return requestedLang === "hi" ? language === "hi" : language === "en";
  });

  const recordedVisibleCourses = recordedCourses.filter((course) => {
    const language = normalizeLanguage(course.language ?? null);
    return requestedLang === "hi" ? language === "hi" : language === "en";
  });

  const renderCourseSection = ({
    type,
    title,
    subtitle,
    courses,
  }: {
    type: "live" | "recorded";
    title: string;
    subtitle: string;
    courses: CourseSummary[];
  }) => {
    const sectionIsLive = type === "live";
    const sectionIsActive = requestedType === type;
    const sectionPage = requestedType === type ? currentResultPage : 1;
    const totalSectionPages = Math.max(1, Math.ceil(courses.length / pageSize));
    const safeSectionPage = Math.min(Math.max(1, sectionPage), totalSectionPages);
    const paginatedCourses = courses.slice((safeSectionPage - 1) * pageSize, safeSectionPage * pageSize);

    return (
      <section
        id={sectionIsLive ? "live-courses" : "recorded-courses"}
        className={`rounded-[30px] border p-4 shadow-[0_26px_64px_rgba(15,23,42,0.08)] backdrop-blur-md sm:p-6 transition-all duration-200 ${
          sectionIsLive
            ? "border-indigo-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.7),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(216,180,254,0.58),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(239,246,255,0.94),_rgba(238,242,255,0.9))] dark:border-indigo-500/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.14),_transparent_26%),linear-gradient(180deg,_rgba(11,17,28,0.98),_rgba(13,20,35,0.96))] dark:shadow-[0_26px_64px_rgba(2,6,23,0.34)]"
            : "border-violet-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(216,180,254,0.72),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(147,197,253,0.7),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.96),_rgba(245,243,255,0.96),_rgba(239,246,255,0.95))] dark:border-violet-500/20 dark:bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_26%),linear-gradient(180deg,_rgba(11,17,28,0.98),_rgba(13,20,35,0.96))] dark:shadow-[0_26px_64px_rgba(2,6,23,0.34)]"
        } ${sectionIsActive ? "ring-2 ring-indigo-300/80 ring-offset-2 ring-offset-white dark:ring-indigo-500/60 dark:ring-offset-slate-950" : ""}`}
      >
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                sectionIsLive
                  ? "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "border-violet-200 bg-violet-100 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  sectionIsLive ? "bg-emerald-500 dark:bg-emerald-400" : "bg-violet-500 dark:bg-violet-400"
                }`}
              />
              {sectionIsLive ? "Live cohort" : "Recorded track"}
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-900 dark:text-white sm:text-3xl">
              {title}
            </h2>
          </div>

          <div className="flex items-center justify-end gap-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/85 p-1 backdrop-blur-sm dark:bg-slate-900/70">
              {languageTabs.map((option) => {
                const active = requestedLang === option.value;
                return (
                  <button
                    key={`${type}-${option.value}`}
                    type="button"
                    onClick={() => updateQuery(type, option.value, 1)}
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
        </div>

        <p className="mb-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>

        {courses.length === 0 ? (
          <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            No {type} courses available in this track yet.
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {paginatedCourses.map((course) => {
                const isPurchased = purchasedCourseIds.has(course.id);
                const detailHref = isPurchased
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
                        href={detailHref}
                        onClick={(event) => {
                          event.preventDefault();
                          router.push(detailHref);
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

            <div className="mt-8 pb-1">
              <PaginationDots
                className="mt-2 flex items-center justify-center gap-2 pt-1"
                currentPage={safeSectionPage - 1}
                totalPages={totalSectionPages}
                showSinglePage={true}
                onPageChange={(page) => {
                  const nextPage = page + 1;
                  router.replace(buildPageHref(nextPage), { scroll: false });
                }}
                onPrevious={() => {
                  if (safeSectionPage > 1) {
                    router.replace(buildPageHref(safeSectionPage - 1), { scroll: false });
                  }
                }}
                onNext={() => {
                  if (safeSectionPage < totalSectionPages) {
                    router.replace(buildPageHref(safeSectionPage + 1), { scroll: false });
                  }
                }}
              />
            </div>
          </>
        )}
      </section>
    );
  };

  const languageTabs = [
    { label: "English", value: "en" },
    { label: "Hindi", value: "hi" },
  ];

  return (
    <div className="mt-6 mx-auto w-full max-w-6xl space-y-6">
      {renderCourseSection({
        type: "live",
        title: "Live cohort programs",
        subtitle: "Instructor-led sessions with live feedback, deadlines, and cohort momentum.",
        courses: liveVisibleCourses,
      })}

      {renderCourseSection({
        type: "recorded",
        title: "Recorded learning paths",
        subtitle: "Flexible, self-paced cohorts built for independent learning and revision.",
        courses: recordedVisibleCourses,
      })}
    </div>
  );
}
