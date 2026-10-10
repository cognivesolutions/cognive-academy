import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { auth } from "@/auth";
import { PaginationDots } from "@/components/pagination-dots";
import { prisma } from "@/lib/prisma";

import { PaginationPageSizeSelect } from "../admin/components/pagination-page-size-select";
import { MyCoursesSearchInput } from "./my-courses-search-input.client";

const tabs = [
  { label: "All", value: "all" },
  { label: "In-Progress", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Live", value: "live" },
  { label: "Recorded", value: "recorded" },
] as const;

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const activeTab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab.toLowerCase() : "all";
  const rawQuery = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q.trim() : "";
  const currentPage = Number.parseInt(typeof resolvedSearchParams.page === "string" ? resolvedSearchParams.page : "1", 10);
  const safePage = Number.isFinite(currentPage) && currentPage > 0 ? currentPage : 1;
  const requestedPageSize = typeof resolvedSearchParams.pageSize === "string" ? resolvedSearchParams.pageSize : "6";
  const effectivePageSize = requestedPageSize === "all" ? Number.MAX_SAFE_INTEGER : Number.parseInt(requestedPageSize, 10) || 6;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const courseIds = enrollments.map((enrollment) => enrollment.courseId);

  const courseLectureCounts = await prisma.lecture.findMany({
    where: {
      module: {
        courseId: { in: courseIds },
      },
    },
    select: {
      id: true,
      module: {
        select: {
          courseId: true,
        },
      },
    },
  });

  const totalLecturesByCourse = new Map<string, number>();
  for (const lecture of courseLectureCounts) {
    totalLecturesByCourse.set(lecture.module.courseId, (totalLecturesByCourse.get(lecture.module.courseId) ?? 0) + 1);
  }

  const lectureProgressEntries = await prisma.lectureProgress.findMany({
    where: {
      userId: session.user.id,
      courseId: { in: courseIds },
    },
    select: {
      courseId: true,
      watchedPercent: true,
    },
  });

  const watchedPercentByCourse = new Map<string, number>();
  const watchedLectureTotals = new Map<string, number>();

  for (const entry of lectureProgressEntries) {
    const total = watchedLectureTotals.get(entry.courseId) ?? 0;
    watchedLectureTotals.set(entry.courseId, total + 1);
    const current = watchedPercentByCourse.get(entry.courseId) ?? 0;
    watchedPercentByCourse.set(entry.courseId, current + entry.watchedPercent);
  }

  const normalizedCourses = enrollments.map((enrollment) => {
    const course = enrollment.course;
    const totalLectures = totalLecturesByCourse.get(course.id) ?? 0;
    const watchedLectureTotal = watchedLectureTotals.get(course.id) ?? 0;
    const watchedPercentTotal = watchedPercentByCourse.get(course.id) ?? 0;
    const progress = totalLectures > 0 ? Math.min(100, Math.max(0, Math.round(watchedPercentTotal / totalLectures))) : watchedLectureTotal > 0 ? Math.min(100, Math.max(0, Math.round(watchedPercentTotal / watchedLectureTotal))) : 0;
    const type = course.isLive ? "Live" : "Recorded";
    const tag = course.isLive ? "Live" : "Recorded";

    return {
      ...enrollment,
      course,
      progress,
      type,
      tag,
    };
  });

  const filteredCourses = normalizedCourses.filter((item) => {
    const course = item.course;
    const haystack = [
      course.title,
      course.slug,
      course.shortDescription ?? "",
      course.description ?? "",
      course.category,
      course.level,
      course.language,
      course.instructorName,
      course.instructorTitle ?? "",
      item.type,
      item.tag,
      course.title.toLowerCase().replace(/[^a-z0-9\s]/g, " "),
      course.shortDescription ?? "",
    ]
      .join(" ")
      .toLowerCase();

    const query = rawQuery.toLowerCase().trim();
    const matchesQuery = !query || haystack.includes(query) || haystack.includes(query.replace(/\s+/g, ""));

    switch (activeTab) {
      case "active":
        return matchesQuery && item.progress < 100;
      case "completed":
        return matchesQuery && item.progress >= 100;
      case "live":
        return matchesQuery && item.type === "Live";
      case "recorded":
        return matchesQuery && item.type === "Recorded";
      default:
        return matchesQuery;
    }
  });

  const activeCount = normalizedCourses.filter((item) => item.progress < 100).length;
  const completedCount = normalizedCourses.filter((item) => item.progress >= 100).length;
  const averageProgress = normalizedCourses.length
    ? Math.round(normalizedCourses.reduce((sum, item) => sum + item.progress, 0) / normalizedCourses.length)
    : 0;
  const nextLiveCourse = normalizedCourses.find((item) => item.type === "Live") ?? normalizedCourses[0];

  const realEnrolledCount = enrollments.length;
  const realActiveCount = normalizedCourses.filter((item) => item.progress > 0 && item.progress < 100).length;
  const realCompletedCount = normalizedCourses.filter((item) => item.progress >= 100).length;
  const realAverageProgress = normalizedCourses.length
    ? Math.round(normalizedCourses.reduce((sum, item) => sum + item.progress, 0) / normalizedCourses.length)
    : 0;

  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / effectivePageSize));
  const page = Math.min(safePage, totalPages);
  const firstVisible = filteredCourses.length === 0 ? 0 : (page - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(page * effectivePageSize, filteredCourses.length);
  const paginatedCourses = filteredCourses.slice((page - 1) * effectivePageSize, page * effectivePageSize);

  const buildHref = (tab: string, nextPage = 1) => {
    const params = new URLSearchParams();
    if (rawQuery) params.set("q", rawQuery);
    if (tab !== "all") params.set("tab", tab);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (requestedPageSize && requestedPageSize !== "6") params.set("pageSize", String(requestedPageSize));
    const query = params.toString();
    return query ? `/my-courses?${query}` : "/my-courses";
  };

  const highlightText = (value: string | null | undefined, searchTerm: string): ReactNode => {
    const text = value ?? "";
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm || !text) {
      return value ?? "";
    }

    const lowerText = text.toLowerCase();
    const lowerTerm = trimmedTerm.toLowerCase();
    const nodes: ReactNode[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      const matchIndex = lowerText.indexOf(lowerTerm, startIndex);

      if (matchIndex === -1) {
        nodes.push(text.slice(startIndex));
        break;
      }

      if (matchIndex > startIndex) {
        nodes.push(text.slice(startIndex, matchIndex));
      }

      const matchText = text.slice(matchIndex, matchIndex + trimmedTerm.length);
      nodes.push(
        <mark
          key={`${matchIndex}-${startIndex}`}
          className="rounded-sm bg-amber-100 px-0.5 py-0.5 font-semibold text-slate-900 shadow-[inset_0_0_0_1px_rgba(202,138,4,0.18)] dark:bg-yellow-200 dark:text-slate-900"
        >
          {matchText}
        </mark>,
      );

      startIndex = matchIndex + trimmedTerm.length;
    }

    return nodes.length > 0 ? nodes : value ?? "";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-indigo-100 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.14),_transparent_28%),linear-gradient(135deg,_#f8fafc_0%,_#eef2ff_48%,_#e0e7ff_100%)] p-5 text-slate-900 shadow-[0_28px_70px_rgba(79,70,229,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(135deg,_#0f172a_0%,_#1e1b4b_52%,_#312e81_100%)] dark:text-white dark:shadow-[0_28px_70px_rgba(79,70,229,0.2)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-indigo-600 dark:text-indigo-200">Learning hub</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">My courses</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/courses#course-results" className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                Browse catalog
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(79,70,229,0.25)] transition hover:shadow-[0_18px_32px_rgba(79,70,229,0.3)] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100">
                Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="group rounded-[24px] border border-indigo-100 bg-[linear-gradient(180deg,_rgba(238,242,255,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(79,70,229,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/80 hover:shadow-[0_18px_38px_rgba(79,70,229,0.12)] dark:border-indigo-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/10 dark:hover:shadow-[0_18px_38px_rgba(99,102,241,0.18)]">
            <div className="text-sm text-indigo-700 dark:text-indigo-300">Enrolled</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{realEnrolledCount}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Courses in your plan</div>
          </div>

          <div className="group rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(16,185,129,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/80 hover:shadow-[0_18px_38px_rgba(16,185,129,0.12)] dark:border-emerald-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/10 dark:hover:shadow-[0_18px_38px_rgba(16,185,129,0.18)]">
            <div className="text-sm text-emerald-700 dark:text-emerald-300">In-Progress</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{realActiveCount}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Still in progress</div>
          </div>

          <div className="group rounded-[24px] border border-violet-100 bg-[linear-gradient(180deg,_rgba(245,243,255,0.96),_rgba(248,250,252,0.94))] p-4 shadow-[0_12px_28px_rgba(168,85,247,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/80 hover:shadow-[0_18px_38px_rgba(168,85,247,0.12)] dark:border-violet-500/20 dark:bg-[linear-gradient(180deg,_rgba(30,41,59,0.95),_rgba(15,23,42,0.86))] dark:hover:border-violet-400/50 dark:hover:bg-violet-500/10 dark:hover:shadow-[0_18px_38px_rgba(168,85,247,0.18)]">
            <div className="text-sm text-violet-700 dark:text-violet-300">Completed</div>
            <div className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">{realCompletedCount}</div>
            <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">Finished this far</div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <Link
                    key={tab.value}
                    href={buildHref(tab.value)}
                    scroll={false}
                    className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_12px_24px_rgba(99,102,241,0.2)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </div>

            <MyCoursesSearchInput defaultValue={rawQuery} />
          </div>

          {filteredCourses.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
              <div className="text-lg font-semibold text-slate-900 dark:text-white">No courses match this view</div>
              <p className="mt-2 text-sm">Try a different filter or browse more courses in the catalog.</p>
              <Link href="/courses#course-results" className="mt-5 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                Explore catalog
              </Link>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCourses.map((item) => {
                  const openCourseHref = item.course.isLive
                    ? `/courses/${item.course.slug}/live`
                    : `/courses/${item.course.slug}/self-paced`;

                  return (
                    <article key={item.id} className="group flex h-full flex-col rounded-[26px] border border-slate-200 bg-[linear-gradient(180deg,_rgba(248,250,252,0.9),_rgba(241,245,249,0.96))] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_36px_rgba(99,102,241,0.08)] dark:border-slate-700 dark:bg-[linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(30,41,59,0.8))] dark:hover:border-indigo-500/40">
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                          {item.type}
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                          {item.progress}%
                        </span>
                      </div>

                      <div className="mt-4 flex-1">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{highlightText(item.course.title, rawQuery)}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {highlightText(item.course.shortDescription ?? "Continue your learning plan and build real-world outcomes.", rawQuery)}
                        </p>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
                          <span>Progress</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-300">
                        <span>{item.course.level}</span>
                        <span>{item.course.category}</span>
                      </div>

                      <div className="mt-5 flex gap-3">
                        <Link
                          href={openCourseHref}
                          className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-cyan-500 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(13,148,136,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(13,148,136,0.34)]"
                        >
                          Continue learning
                        </Link>
                        <Link
                          href={`/courses/${item.course.slug}#curriculum`}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                        >
                          Syllabus
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
                <div className="flex items-center justify-end gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    <span>Records per page</span>
                    <PaginationPageSizeSelect
                      defaultValue={requestedPageSize === "all" ? "6" : String(effectivePageSize)}
                      options={[
                        { value: "3", label: "3" },
                        { value: "6", label: "6" },
                        { value: "9", label: "9" },
                        { value: "10", label: "10" },
                        { value: "20", label: "20" },
                        { value: "50", label: "50" },
                        { value: "100", label: "100" },
                      ]}
                    />
                  </div>

                  <span className="min-w-[78px] text-right text-[11px] font-medium text-slate-600 dark:text-slate-300">
                    {filteredCourses.length === 0 ? 0 : firstVisible}-{lastVisible} of {filteredCourses.length}
                  </span>

                  <PaginationDots
                    currentPage={page - 1}
                    totalPages={totalPages}
                    showSinglePage={true}
                    pageHrefs={Array.from({ length: totalPages }, (_, index) =>
                      buildHref(activeTab, index + 1),
                    )}
                    previousHref={page > 1 ? buildHref(activeTab, page - 1) : undefined}
                    nextHref={page < totalPages ? buildHref(activeTab, page + 1) : undefined}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
