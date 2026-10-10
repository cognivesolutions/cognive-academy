import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CourseCard } from "@/components/course-card";
import { PaginationDots } from "@/components/pagination-dots";
import { prisma } from "@/lib/prisma";

import { PaginationPageSizeSelect } from "../admin/components/pagination-page-size-select";
import { MyCoursesSearchInput } from "../my-courses/my-courses-search-input.client";

const savedTabs = [
  { label: "All", value: "all" },
  { label: "Live", value: "live" },
  { label: "Recorded", value: "recorded" },
] as const;

export default async function SavedCoursesPage({
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

  const savedCourses = await prisma.savedCourse.findMany({
    where: { userId: session.user.id },
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });

  const filteredCourses = savedCourses.filter((savedCourse) => {
    const course = savedCourse.course;
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
      course.title.toLowerCase().replace(/[^a-z0-9\s]/g, " "),
    ]
      .join(" ")
      .toLowerCase();

    const query = rawQuery.toLowerCase().trim();
    const matchesQuery = !query || haystack.includes(query) || haystack.includes(query.replace(/\s+/g, ""));

    switch (activeTab) {
      case "live":
        return matchesQuery && course.isLive;
      case "recorded":
        return matchesQuery && !course.isLive;
      default:
        return matchesQuery;
    }
  });

  const savedCourseIds = new Set(savedCourses.map((savedCourse) => savedCourse.courseId));
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
    return query ? `/saved-courses?${query}` : "/saved-courses";
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-6 sm:py-8 lg:py-10">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-rose-100 bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.12),_transparent_30%),linear-gradient(135deg,_#fff7ed_0%,_#fff1f2_45%,_#fdf2f8_100%)] p-5 text-slate-900 shadow-[0_28px_70px_rgba(244,63,94,0.08)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,63,94,0.16),_transparent_28%),linear-gradient(135deg,_#0f172a_0%,_#3f0f38_52%,_#1f2937_100%)] dark:text-white dark:shadow-[0_28px_70px_rgba(244,63,94,0.12)] sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-600 dark:text-rose-200">Saved</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">Saved courses</h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/my-courses" className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/15">
                My courses
              </Link>
              <Link href="/courses#course-results" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(79,70,229,0.25)] transition hover:shadow-[0_18px_32px_rgba(79,70,229,0.3)]">
                Browse catalog
              </Link>
            </div>
          </div>
        </section>

        {savedCourses.length === 0 ? (
          <section className="rounded-[30px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(15,23,42,0.24)]">
            <div className="text-xl font-bold text-slate-900 dark:text-white">No saved courses yet</div>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Pick a few courses from the catalog and they will appear here.</p>
            <Link href="/courses#course-results" className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.28)]">
              Explore catalog
            </Link>
          </section>
        ) : (
          <section className="rounded-[30px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900/80 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                {savedTabs.map((tab) => {
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
                <div className="text-lg font-semibold text-slate-900 dark:text-white">No saved courses match this view</div>
                <p className="mt-2 text-sm">Try a different filter or save more courses from the catalog.</p>
                <Link href="/courses#course-results" className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.28)]">
                  Explore catalog
                </Link>
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {paginatedCourses.map((savedCourse) => {
                    const course = savedCourse.course;
                    const destination = course.isLive ? `/courses/${course.slug}/live` : `/courses/${course.slug}/self-paced`;

                    return (
                      <CourseCard
                        key={savedCourse.id}
                        course={course}
                        statusLabel={course.isLive ? "Live" : "Recorded"}
                        statusTone={course.isLive ? "live" : "recorded"}
                        savedCourseIds={savedCourseIds}
                        searchQuery={rawQuery}
                        action={
                          <Link
                            href={destination}
                            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(99,102,241,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(99,102,241,0.28)]"
                          >
                            View course
                          </Link>
                        }
                      />
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
                      pageHrefs={Array.from({ length: totalPages }, (_, index) => buildHref(activeTab, index + 1))}
                      previousHref={page > 1 ? buildHref(activeTab, page - 1) : undefined}
                      nextHref={page < totalPages ? buildHref(activeTab, page + 1) : undefined}
                    />
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
