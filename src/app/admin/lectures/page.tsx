import Link from "next/link";
import { redirect } from "next/navigation";

import { AdminModeToggle } from "../components/admin-mode-toggle.client";
import { AdminNavbar } from "../components/admin-navbar";
import { AdminTableFilterBar } from "../components/admin-table-filter-bar";
import { CourseSearchInput } from "../components/course-search-input";
import { CourseSelect } from "../components/course-select";
import { PaginationPageSizeSelect } from "../components/pagination-page-size-select";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PaginationDots } from "@/components/pagination-dots";

export const dynamic = "force-dynamic";

export default async function AdminLecturesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/admin/login?callbackUrl=${encodeURIComponent("/admin/lectures")}`);
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? "";
  const courseFilter = Array.isArray(resolvedSearchParams.course)
    ? resolvedSearchParams.course[0] ?? "all"
    : resolvedSearchParams.course ?? "all";
  const categoryFilter = Array.isArray(resolvedSearchParams.category)
    ? resolvedSearchParams.category[0] ?? "all"
    : resolvedSearchParams.category ?? "all";
  const formatFilter = Array.isArray(resolvedSearchParams.format)
    ? resolvedSearchParams.format[0] ?? "all"
    : resolvedSearchParams.format ?? "all";
  const statusFilter = Array.isArray(resolvedSearchParams.status)
    ? resolvedSearchParams.status[0] ?? "all"
    : resolvedSearchParams.status ?? "all";
  const rawPage = Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? "1");
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize)
    ? resolvedSearchParams.pageSize[0] ?? "9"
    : resolvedSearchParams.pageSize ?? "9";

  const requestedPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const fallbackPageSize = rawPageSize === "all" ? "all" : Number(rawPageSize) || 9;
  const pageSize = fallbackPageSize === "all" ? "all" : Math.max(1, Math.min(100, fallbackPageSize));
  const page = Math.max(1, requestedPage);

  const courses = await prisma.course.findMany({
    orderBy: [{ isPublished: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      level: true,
      isPublished: true,
      isLive: true,
      language: true,
      modules: { include: { lectures: true } },
    },
  });

  const normalizedSearch = q.trim().toLowerCase();
  const categoryOptions = Array.from(new Set(courses.map((course) => course.category).filter(Boolean))).sort();
  const courseOptions = courses
    .map((course) => ({ value: course.id, label: course.title }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filteredCourses = courses.filter((course) => {
    const lectureCount = course.modules.reduce((total, module) => total + module.lectures.length, 0);
    const liveLectureCount = course.modules.reduce(
      (total, module) => total + module.lectures.filter((lecture) => Boolean(lecture.liveSessionUrl)).length,
      0,
    );
    const recordedLectureCount = course.modules.reduce(
      (total, module) => total + module.lectures.filter((lecture) => Boolean(lecture.hlsUrl?.trim() || lecture.videoUrl?.trim())).length,
      0,
    );
    const searchableText = [
      course.title,
      course.category,
      course.level,
      course.language,
      course.isLive ? "live" : "recorded",
      course.isPublished ? "published" : "draft",
      ...course.modules.flatMap((module) => [
        module.title,
        ...module.lectures.map((lecture) => lecture.title),
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesCourse = courseFilter === "all" || course.id === courseFilter;
    const matchesCategory = categoryFilter === "all" || course.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || (statusFilter === "published" && course.isPublished) || (statusFilter === "draft" && !course.isPublished);
    const matchesFormat = formatFilter === "all" || (formatFilter === "live" && course.isLive) || (formatFilter === "recorded" && !course.isLive);
    const matchesText =
      !normalizedSearch ||
      searchableText.includes(normalizedSearch) ||
      course.title.toLowerCase().includes(normalizedSearch) ||
      course.category?.toLowerCase().includes(normalizedSearch) ||
      String(lectureCount).includes(normalizedSearch) ||
      String(liveLectureCount).includes(normalizedSearch) ||
      String(recordedLectureCount).includes(normalizedSearch);

    return matchesCourse && matchesCategory && matchesStatus && matchesFormat && matchesText;
  });

  const hasActiveFilters = Boolean(q || courseFilter !== "all" || categoryFilter !== "all" || statusFilter !== "all" || formatFilter !== "all");

  const effectivePageSize = pageSize === "all" ? filteredCourses.length || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / effectivePageSize));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * effectivePageSize;
  const paginatedCourses = filteredCourses.slice(skip, skip + effectivePageSize);

  const buildPageHref = (nextPage: number) => {
    const params = new URLSearchParams();

    if (q) {
      params.set("q", q);
    }

    if (courseFilter !== "all") {
      params.set("course", courseFilter);
    }

    if (categoryFilter !== "all") {
      params.set("category", categoryFilter);
    }

    if (formatFilter !== "all") {
      params.set("format", formatFilter);
    }

    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    }

    if (pageSize === "all") {
      params.set("pageSize", "all");
    } else {
      params.set("pageSize", String(pageSize));
    }

    params.set("page", String(nextPage));

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "?";
  };

  const currentPageIndex = safePage - 1;
  const firstVisible = filteredCourses.length === 0 ? 0 : (safePage - 1) * effectivePageSize + 1;
  const lastVisible = Math.min(safePage * effectivePageSize, filteredCourses.length);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Manage lectures</h1>
          </div>
          <AdminModeToggle />
        </div>

        <div className="flex flex-col gap-4">
          <AdminNavbar />

          <div className="flex-1">
            <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Modules</p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Courses</h2>
                </div>
                <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                  {filteredCourses.length} course{filteredCourses.length === 1 ? "" : "s"}
                </div>
              </div>

              <div className="mb-4">
                <AdminTableFilterBar
                  hasActiveFilters={hasActiveFilters}
                  clearFiltersHref="/admin/lectures"
                  clearFiltersLabel="Remove filter"
                  leftControls={
                    <>
                      <div className="min-w-[180px]">
                        <CourseSelect
                          name="course"
                          label="Course"
                          compact
                          hideLabel
                          placeholder="All"
                          defaultValue={courseFilter || "all"}
                          options={[{ value: "all", label: "All courses" }, ...courseOptions]}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] dark:!border-slate-700 dark:!bg-slate-900/80 dark:!text-slate-100 dark:!shadow-none"
                          menuClassName="!min-w-[180px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>
                      <div className="min-w-[140px]">
                        <CourseSelect
                          name="category"
                          label="Category"
                          compact
                          hideLabel
                          placeholder="All"
                          defaultValue={categoryFilter || "all"}
                          options={[
                            { value: "all", label: "All" },
                            ...categoryOptions.map((category) => ({ value: category, label: category })),
                          ]}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] dark:!border-slate-700 dark:!bg-slate-900/80 dark:!text-slate-100 dark:!shadow-none"
                          menuClassName="!min-w-[140px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>
                      <div className="min-w-[120px]">
                        <CourseSelect
                          name="format"
                          label="Format"
                          compact
                          hideLabel
                          placeholder="All"
                          defaultValue={formatFilter || "all"}
                          options={[
                            { value: "all", label: "All" },
                            { value: "live", label: "Live" },
                            { value: "recorded", label: "Recorded" },
                          ]}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] dark:!border-slate-700 dark:!bg-slate-900/80 dark:!text-slate-100 dark:!shadow-none"
                          menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>
                      <div className="min-w-[120px]">
                        <CourseSelect
                          name="status"
                          label="Status"
                          compact
                          hideLabel
                          placeholder="All"
                          defaultValue={statusFilter || "all"}
                          options={[
                            { value: "all", label: "All" },
                            { value: "published", label: "Published" },
                            { value: "draft", label: "Draft" },
                          ]}
                          triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(15,23,42,0.06)] dark:!border-slate-700 dark:!bg-slate-900/80 dark:!text-slate-100 dark:!shadow-none"
                          menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                        />
                      </div>
                    </>
                  }
                  rightControls={<CourseSearchInput defaultValue={q} />}
                />
              </div>

              {filteredCourses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {hasActiveFilters ? "No lectures match your filters." : "No courses have been added yet."}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {paginatedCourses.map((course) => {
                      const lectureCount = course.modules.reduce((total, module) => total + module.lectures.length, 0);
                      const liveLectureCount = course.modules.reduce(
                        (total, module) => total + module.lectures.filter((lecture) => Boolean(lecture.liveSessionUrl)).length,
                        0,
                      );
                      const recordedLectureCount = course.modules.reduce(
                        (total, module) =>
                          total + module.lectures.filter((lecture) => Boolean(lecture.hlsUrl?.trim() || lecture.videoUrl?.trim())).length,
                        0,
                      );
                      const previewLectureCount = course.modules.reduce(
                        (total, module) => total + module.lectures.filter((lecture) => lecture.isPreview).length,
                        0,
                      );

                      return (
                        <div key={course.id} className="group flex h-full flex-col rounded-[20px] border border-slate-200 bg-slate-50/80 p-4 shadow-[0_8px_20px_rgba(15,23,42,0.03)] transition-all duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-[0_18px_36px_rgba(99,102,241,0.12)] dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-indigo-500/35 dark:hover:shadow-[0_18px_36px_rgba(15,23,42,0.35)]">
                          <div className="mb-3 flex min-h-[72px] items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                {course.category}
                              </div>
                              <h3 className="mt-2 line-clamp-2 text-lg font-black tracking-tight text-slate-900 dark:text-white">
                                {course.title}
                              </h3>
                            </div>
                            <span
                              className={
                                course.isPublished
                                  ? "shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
                                  : "shrink-0 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-500/10 dark:text-amber-200"
                              }
                            >
                              {course.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>

                          <div className="mb-4 flex min-h-[40px] flex-wrap items-center gap-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
                            {course.isLive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-400" />
                                Recorded
                              </span>
                            )}
                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-200">
                              {course.level ?? "Beginner"}
                            </span>
                            <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-cyan-700 dark:border-cyan-500/30 dark:bg-cyan-500/10 dark:text-cyan-200">
                              {course.language === "hi" ? "Hindi" : "English"}
                            </span>
                          </div>

                          <div className="mb-4 grid grid-cols-3 gap-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">
                            <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-slate-200 bg-white px-2 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_20px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
                              <div className="text-base font-black text-slate-900 dark:text-white">{lectureCount}</div>
                              <div>Total</div>
                            </div>
                            <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-[0_10px_20px_rgba(16,185,129,0.10)] dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:hover:border-emerald-400/40">
                              <div className="text-base font-black text-emerald-700 dark:text-emerald-200">{liveLectureCount}</div>
                              <div>Live</div>
                            </div>
                            <div className="flex min-h-[58px] flex-col justify-center rounded-xl border border-indigo-200 bg-indigo-50 px-2 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-[0_10px_20px_rgba(99,102,241,0.10)] dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:hover:border-indigo-400/40">
                              <div className="text-base font-black text-indigo-700 dark:text-indigo-200">{recordedLectureCount}</div>
                              <div>Video</div>
                            </div>
                          </div>

                          <div className="mt-auto">
                            <div className="mb-4 flex min-h-[24px] items-center justify-between text-sm text-slate-600 dark:text-slate-300">
                              <span>{lectureCount} lecture{lectureCount === 1 ? "" : "s"}</span>
                              {previewLectureCount > 0 ? <span className="text-amber-600 dark:text-amber-300">{previewLectureCount} preview</span> : null}
                            </div>

                            <Link
                              href={`/admin/courses/${course.id}/lectures?courseId=${course.id}`}
                              className="inline-flex w-full items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-[11px] font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
                            >
                              Manage lectures
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {filteredCourses.length > 0 && totalPages > 1 ? (
                    <div className="mt-5 flex items-center justify-end gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                        <span>Cards per page</span>
                        <PaginationPageSizeSelect defaultValue={String(pageSize === "all" ? "all" : pageSize)} />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="min-w-[92px] text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                          {firstVisible}-{lastVisible} of {filteredCourses.length}
                        </span>

                        <PaginationDots
                          currentPage={currentPageIndex}
                          totalPages={totalPages}
                          showSinglePage={true}
                          pageHrefs={Array.from({ length: totalPages }, (_, index) => buildPageHref(index + 1))}
                          previousHref={currentPageIndex > 0 ? buildPageHref(currentPageIndex) : undefined}
                          nextHref={currentPageIndex < totalPages - 1 ? buildPageHref(currentPageIndex + 2) : undefined}
                        />
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
