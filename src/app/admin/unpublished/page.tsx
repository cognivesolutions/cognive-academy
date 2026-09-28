import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseSearchInput } from "../components/course-search-input";
import { CourseSelect } from "../components/course-select";
import { PaginationPageSizeSelect } from "../components/pagination-page-size-select";
import UnpublishedCourseGrid from "./unpublished-course-grid.client";

export default async function UnpublishedPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/admin/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const successMessage = typeof resolvedSearchParams.success === "string" ? resolvedSearchParams.success : "";
  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q ?? "";
  const categoryParam = Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category[0] : resolvedSearchParams.category ?? "";
  const levelParam = Array.isArray(resolvedSearchParams.level) ? resolvedSearchParams.level[0] : resolvedSearchParams.level ?? "";
  const languageParam = Array.isArray(resolvedSearchParams.language) ? resolvedSearchParams.language[0] : resolvedSearchParams.language ?? "";
  const formatParam = Array.isArray(resolvedSearchParams.format) ? resolvedSearchParams.format[0] : resolvedSearchParams.format;

  const page = Math.max(Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? 1) || 1, 1);
  const rawPageSize = Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize ?? "10";
  const isAllPageSize = rawPageSize === "all" || rawPageSize === "";
  const pageSize = isAllPageSize ? Number.MAX_SAFE_INTEGER : Math.max(Number(rawPageSize) || 10, 1);

  const where: any = { isPublished: false };
  if (q) {
    const normalizedQuery = q.trim();
    const searchQuery = normalizedQuery.toLowerCase();
    const searchConditions: any[] = [
      { title: { contains: normalizedQuery, mode: "insensitive" } },
      { shortDescription: { contains: normalizedQuery, mode: "insensitive" } },
      { description: { contains: normalizedQuery, mode: "insensitive" } },
      { category: { contains: normalizedQuery, mode: "insensitive" } },
      { instructorName: { contains: normalizedQuery, mode: "insensitive" } },
      { instructorTitle: { contains: normalizedQuery, mode: "insensitive" } },
      { level: { contains: normalizedQuery, mode: "insensitive" } },
      { language: { contains: normalizedQuery, mode: "insensitive" } },
      { slug: { contains: normalizedQuery, mode: "insensitive" } },
    ];

    const numericPriceSearch = Number(normalizedQuery);
    if (!Number.isNaN(numericPriceSearch)) {
      searchConditions.push({ price: { equals: numericPriceSearch } });
    }

    if (searchQuery === "live") {
      searchConditions.push({ isLive: true });
    }

    if (searchQuery === "recorded") {
      searchConditions.push({ isLive: false });
    }

    if (searchQuery === "featured" || searchQuery === "starred") {
      searchConditions.push({ featured: true });
    }

    if (searchQuery === "draft") {
      searchConditions.push({ isPublished: false });
    }

    if (searchQuery === "published") {
      searchConditions.push({ isPublished: true });
    }

    if (searchQuery === "free" || searchQuery === "gratis") {
      searchConditions.push({ price: { equals: 0 } });
    }

    if (searchQuery === "paid" || searchQuery === "premium") {
      searchConditions.push({ price: { gt: 0 } });
    }

    if (searchQuery === "beginner" || searchQuery === "new" || searchQuery === "starter") {
      searchConditions.push({ level: { contains: "Beginner", mode: "insensitive" } });
    }

    if (searchQuery === "advanced" || searchQuery === "expert") {
      searchConditions.push({ level: { contains: "Advanced", mode: "insensitive" } });
    }

    if (searchQuery === "intermediate" || searchQuery === "mid") {
      searchConditions.push({ level: { contains: "Intermediate", mode: "insensitive" } });
    }

    if (searchQuery === "english" || searchQuery === "en") {
      searchConditions.push({ language: { contains: "en", mode: "insensitive" } });
    }

    if (searchQuery === "hindi" || searchQuery === "hi") {
      searchConditions.push({ language: { contains: "hi", mode: "insensitive" } });
    }

    if (searchQuery === "online" || searchQuery === "virtual") {
      searchConditions.push({ isLive: true });
    }

    if (searchQuery === "offline" || searchQuery === "recorded") {
      searchConditions.push({ isLive: false });
    }

    where.OR = searchConditions;
  }

  if (categoryParam) {
    where.category = categoryParam;
  }

  if (levelParam) {
    where.level = levelParam;
  }

  if (languageParam) {
    where.language = languageParam;
  }

  if (formatParam !== undefined) {
    if (formatParam === "true" || formatParam === "1") {
      where.isLive = true;
    } else if (formatParam === "false" || formatParam === "0") {
      where.isLive = false;
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * (isAllPageSize ? 0 : pageSize),
      take: isAllPageSize ? undefined : pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        isLive: true,
        language: true,
        price: true,
        imageUrl: true,
        previewLectureUrl: true,
        shortDescription: true,
        description: true,
        instructorName: true,
        instructorTitle: true,
        durationHours: true,
        level: true,
        isPublished: true,
        featured: true,
        createdAt: true,
      },
    }),
    prisma.course.count({ where }),
  ]);

  const totalPages = isAllPageSize ? 1 : Math.max(Math.ceil(total / pageSize), 1);
  const hasActiveFilters = Boolean(
    q ||
      categoryParam ||
      levelParam ||
      languageParam ||
      rawPageSize !== "10" && rawPageSize !== "all" && rawPageSize !== "" ||
      formatParam === "true" ||
      formatParam === "false" ||
      formatParam === "1" ||
      formatParam === "0"
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Unpublished courses</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-2 text-sm font-semibold text-indigo-700 shadow-[0_8px_20px_rgba(99,102,241,0.08)] backdrop-blur-sm transition duration-200 hover:border-indigo-300 hover:bg-indigo-100 hover:shadow-[0_10px_24px_rgba(99,102,241,0.12)] hover:brightness-105 active:scale-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:hover:border-indigo-400/50 dark:hover:bg-indigo-500/15"
            >
              Create Course
            </Link>
            <Link
              href="/admin/courses"
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
            >
              Manage Courses
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
            {successMessage}
          </div>
        )}

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-300">Unpublished</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white">Saved but not published</h2>
            </div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              {total} course{total === 1 ? "" : "s"}
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <form method="GET" className="space-y-2">
              <div className="flex w-full flex-nowrap items-center justify-between gap-2 rounded-full border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_rgba(255,255,255,0.98)_38%,_rgba(241,245,249,1)_100%)] p-1.5 shadow-[0_18px_32px_rgba(15,23,42,0.12)] dark:border-slate-700 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] dark:shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
                <div className="flex min-w-0 flex-nowrap items-center justify-start gap-2">
                  {hasActiveFilters ? (
                    <Link
                      href="/admin/unpublished"
                      className="inline-flex h-[38px] items-center justify-center rounded-full border border-red-200 bg-red-50/80 px-4 py-0 text-sm font-semibold text-red-700 shadow-[0_8px_20px_rgba(239,68,68,0.08)] backdrop-blur-sm transition duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-[0_10px_24px_rgba(239,68,68,0.12)] hover:brightness-105 active:scale-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200 dark:hover:border-red-400/50 dark:hover:bg-red-500/15"
                    >
                      Remove filter
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="inline-flex cursor-not-allowed items-center justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 shadow-[0_6px_16px_rgba(15,23,42,0.04)] opacity-70 transition duration-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500"
                    >
                      Remove filter
                    </button>
                  )}
                  <div className="min-w-[140px]">
                    <CourseSelect
                      name="category"
                      label="Category"
                      compact
                      hideLabel
                      placeholder="All"
                      defaultValue={categoryParam || "all"}
                      options={[
                        { value: "all", label: "All" },
                        { value: "Software Development", label: "Software Development" },
                        { value: "AI Engineering", label: "AI Engineering" },
                        { value: "Data Engineering", label: "Data Engineering" },
                        { value: "Data Analytics", label: "Data Analytics" },
                        { value: "Data Structure & Algorithms", label: "DSA" },
                      ]}
                      triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      menuClassName="!min-w-[140px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                    />
                  </div>
                  <div className="min-w-[120px]">
                    <CourseSelect
                      name="level"
                      label="Level"
                      compact
                      hideLabel
                      placeholder="All"
                      defaultValue={levelParam || "all"}
                      options={[
                        { value: "all", label: "All" },
                        { value: "Beginner", label: "Beginner" },
                        { value: "Intermediate", label: "Intermediate" },
                        { value: "Advanced", label: "Advanced" },
                      ]}
                      triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                    />
                  </div>
                  <div className="min-w-[120px]">
                    <CourseSelect
                      name="format"
                      label="Format"
                      compact
                      hideLabel
                      placeholder="All"
                      defaultValue={formatParam === "true" || formatParam === "false" ? formatParam : "all"}
                      options={[
                        { value: "all", label: "All" },
                        { value: "true", label: "Live" },
                        { value: "false", label: "Recorded" },
                      ]}
                      triggerClassName="!h-[38px] !min-h-[38px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                    />
                  </div>
                  <div className="min-w-[120px]">
                    <CourseSelect
                      name="language"
                      label="Language"
                      compact
                      hideLabel
                      placeholder="All"
                      defaultValue={languageParam || "all"}
                      options={[
                        { value: "all", label: "All" },
                        { value: "en", label: "English" },
                        { value: "hi", label: "Hindi" },
                      ]}
                      triggerClassName="!h-[38px] !min-h-[38px] !w-[120px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                      menuClassName="!min-w-[120px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                    />
                  </div>
                </div>

                <div className="ml-auto flex-shrink-0">
                  <CourseSearchInput defaultValue={q} />
                </div>
              </div>
            </form>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {q || categoryParam || levelParam || languageParam || formatParam ? "No courses match your search." : "No unpublished courses yet. Save a course and it will appear here."}
            </div>
          ) : (
            <>
              <UnpublishedCourseGrid
                courses={courses.map((course) => ({
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  category: course.category,
                  level: course.level,
                  isLive: course.isLive,
                  language: course.language,
                  price: Number(course.price),
                  imageUrl: course.imageUrl,
                  shortDescription: course.shortDescription,
                  description: course.description,
                  instructorName: course.instructorName,
                  instructorTitle: course.instructorTitle,
                  durationHours: course.durationHours,
                  previewLectureUrl: course.previewLectureUrl,
                }))}
              />

              <div className="mt-3 flex items-center justify-end gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span>Courses per page</span>
                  <CourseSelect
                    name="pageSize"
                    label=""
                    hideLabel
                    compact
                    placeholder="10"
                    defaultValue={String(pageSize || "10")}
                    options={[
                      { value: "all", label: "All" },
                      { value: "5", label: "5" },
                      { value: "10", label: "10" },
                      { value: "20", label: "20" },
                      { value: "50", label: "50" },
                      { value: "100", label: "100" },
                    ]}
                    triggerClassName="!min-h-[38px] !w-[88px] !rounded-full !border-slate-200 !bg-white/90 !text-slate-700 !shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] dark:!border-slate-700 dark:!bg-slate-900/70 dark:!text-slate-100 dark:!shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    menuClassName="!min-w-[88px] !rounded-2xl !border-slate-200 !bg-white !text-slate-700 dark:!border-slate-700 dark:!bg-slate-950 dark:!text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-0.5">
                  <span className="min-w-[88px] text-right text-xs font-medium text-slate-600 dark:text-slate-300">
                    {Math.min((page - 1) * pageSize + 1, total)}-{Math.min(page * pageSize, total)} of {total}
                  </span>

                  <div className="flex items-center gap-0.5">
                    <Link
                      href={`?page=${Math.max(page - 1, 1)}&pageSize=${isAllPageSize ? "all" : pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&level=${encodeURIComponent(levelParam || "")}&language=${encodeURIComponent(languageParam || "")}&format=${encodeURIComponent(formatParam ?? "")}`}
                      aria-label="Previous page"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition ${page === 1 ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"}`}
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3 w-3">
                        <path d="M12.5 5.5L7.5 10l5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>

                    <Link
                      href={`?page=${Math.min(page + 1, totalPages)}&pageSize=${isAllPageSize ? "all" : pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&level=${encodeURIComponent(levelParam || "")}&language=${encodeURIComponent(languageParam || "")}&format=${encodeURIComponent(formatParam ?? "")}`}
                      aria-label="Next page"
                      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-sm transition ${page >= totalPages ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white"}`}
                    >
                      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3 w-3">
                        <path d="M7.5 14.5L12.5 10l-5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
