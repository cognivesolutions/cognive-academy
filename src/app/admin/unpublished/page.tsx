import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseSelect } from "../components/course-select";
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

  const page = Math.max(Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? 1) || 1, 1);
  const pageSize = Math.max(Number(Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize ?? 10) || 10, 1);

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where: { isPublished: false },
      skip: (page - 1) * pageSize,
      take: pageSize,
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
    prisma.course.count({ where: { isPublished: false } }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

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
              {total} unpublished{total === 1 ? "" : ""}
            </div>
          </div>

          <div className="mb-4 space-y-3">
            <form method="GET" className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-slate-700 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_rgba(10,18,31,0.96)_38%,_rgba(2,6,23,1)_100%)] p-2 shadow-[0_18px_32px_rgba(15,23,42,0.28)]">
                <input
                  name="q"
                  defaultValue={Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] ?? "" : resolvedSearchParams.q ?? ""}
                  placeholder="Search course title, category, description..."
                  className="min-w-[220px] flex-1 rounded-full border border-slate-700 bg-slate-950/35 px-4 py-3 text-[0.92rem] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-slate-950/50 focus:ring-2 focus:ring-indigo-500/10"
                />
                <div className="w-[96px]">
                  <CourseSelect
                    name="pageSize"
                    label=""
                    hideLabel
                    compact
                    placeholder="10"
                    defaultValue={String(pageSize)}
                    options={[
                      { value: "5", label: "5" },
                      { value: "10", label: "10" },
                      { value: "20", label: "20" },
                      { value: "50", label: "50" },
                    ]}
                    triggerClassName="!min-h-[44px] !rounded-full !border-slate-700 !bg-slate-900/70 !text-slate-100 !shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                    menuClassName="!min-w-[96px] !rounded-2xl !border-slate-700 !bg-slate-950 !text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-sm font-semibold text-emerald-700 shadow-[0_8px_20px_rgba(16,185,129,0.08)] backdrop-blur-sm transition duration-200 hover:border-emerald-300 hover:bg-emerald-100 hover:shadow-[0_10px_24px_rgba(16,185,129,0.12)] hover:brightness-105 active:scale-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200 dark:hover:border-emerald-400/50 dark:hover:bg-emerald-500/15"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>

          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              No unpublished courses yet. Save a course and it will appear here.
            </div>
          ) : (
            <>
              <UnpublishedCourseGrid
                courses={courses.map((course) => ({
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  category: course.category,
                  isLive: course.isLive,
                  language: course.language,
                  price: Number(course.price),
                  imageUrl: course.imageUrl,
                  shortDescription: course.shortDescription,
                  previewLectureUrl: course.previewLectureUrl,
                }))}
              />

              <div className="mt-6 flex items-center justify-between gap-3 text-sm">
                <div className="text-xs text-slate-600 dark:text-slate-300">Page {page} of {totalPages} • {total} courses</div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`?page=${Math.max(page - 1, 1)}&pageSize=${pageSize}`}
                    aria-label="Previous page"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${page === 1 ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M12.5 5.5L7.5 10l5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>

                  {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
                    const pageNumber = Math.max(1, Math.min(page, totalPages - 4)) + index;
                    const isActive = pageNumber === page;
                    const href = `?page=${pageNumber}&pageSize=${pageSize}`;

                    return (
                      <a
                        key={pageNumber}
                        href={href}
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-[0_8px_18px_rgba(99,102,241,0.22)]"
                            : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"
                        }`}
                      >
                        {pageNumber}
                      </a>
                    );
                  })}

                  <a
                    href={`?page=${Math.min(page + 1, totalPages)}&pageSize=${pageSize}`}
                    aria-label="Next page"
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${page >= totalPages ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"}`}
                  >
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                      <path d="M7.5 14.5L12.5 10l-5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
