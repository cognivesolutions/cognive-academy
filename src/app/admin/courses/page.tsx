import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CourseSelect } from "../components/course-select";
import ManageCourseGrid from "./manage-course-grid.client";

export default async function ManageCoursesPage({
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

  const q = Array.isArray(resolvedSearchParams.q) ? resolvedSearchParams.q[0] : resolvedSearchParams.q ?? "";
  const categoryParam = Array.isArray(resolvedSearchParams.category) ? resolvedSearchParams.category[0] : resolvedSearchParams.category ?? "";
  const publishedParam = Array.isArray(resolvedSearchParams.published) ? resolvedSearchParams.published[0] : resolvedSearchParams.published;

  const page = Math.max(Number(Array.isArray(resolvedSearchParams.page) ? resolvedSearchParams.page[0] : resolvedSearchParams.page ?? 1) || 1, 1);
  const pageSize = Math.max(Number(Array.isArray(resolvedSearchParams.pageSize) ? resolvedSearchParams.pageSize[0] : resolvedSearchParams.pageSize ?? 10) || 10, 1);

  const where: any = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { shortDescription: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { instructorName: { contains: q, mode: "insensitive" } },
      { level: { contains: q, mode: "insensitive" } },
    ];
  }

  if (categoryParam) {
    where.category = categoryParam;
  }

  if (publishedParam !== undefined) {
    if (publishedParam === "true" || publishedParam === "1") {
      where.isPublished = true;
    } else if (publishedParam === "false" || publishedParam === "0") {
      where.isPublished = false;
    }
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        category: true,
        isLive: true,
        language: true,
        price: true,
        slug: true,
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
      },
    }),
    prisma.course.count({ where }),
  ]);

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-300">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900 dark:text-white">Manage courses</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/courses/new"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5"
            >
              Create course
            </Link>
            <Link
              href="/admin/unpublished"
              className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Unpublished
            </Link>
          </div>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900/80">
          <div className="space-y-3">
            <form method="GET" className="space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <input
                  name="q"
                  defaultValue={q}
                  placeholder="Search course title, category, description..."
                  className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-[0.92rem] text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04)] placeholder:text-slate-400 outline-none transition duration-200 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
                <div className="w-[84px]">
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
                    triggerClassName="min-h-[38px] !bg-slate-50 dark:!bg-slate-800"
                    menuClassName="min-w-[84px]"
                  />
                </div>
                <div className="min-w-[148px]">
                  <CourseSelect
                    name="published"
                    label=""
                    hideLabel
                    compact
                    placeholder="Any status"
                    defaultValue={publishedParam ?? ""}
                    options={[
                      { value: "", label: "Any status" },
                      { value: "true", label: "Published" },
                      { value: "false", label: "Unpublished" },
                    ]}
                    triggerClassName="min-h-[38px] !bg-slate-50 dark:!bg-slate-800"
                    menuClassName="min-w-[148px]"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-2 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(99,102,241,0.22)] transition hover:brightness-110"
                >
                  Apply Filter
                </button>
              </div>
            </form>

            {courses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                No courses added yet.
              </div>
            ) : (
              <ManageCourseGrid
                courses={courses.map((course) => ({
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  price: Number(course.price),
                  imageUrl: course.imageUrl,
                  isLive: course.isLive,
                  language: course.language,
                  previewLectureUrl: course.previewLectureUrl,
                }))}
              />
            )}
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <div className="text-xs text-slate-600 dark:text-slate-300">Page {page} of {totalPages} • {total} courses</div>
            <div className="flex items-center gap-1.5">
              <a
                href={`?page=${Math.max(page - 1, 1)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
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
                const href = `?page=${pageNumber}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`;

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
                href={`?page=${Math.min(page + 1, totalPages)}&pageSize=${pageSize}&q=${encodeURIComponent(q || "")}&category=${encodeURIComponent(categoryParam || "")}&published=${encodeURIComponent(publishedParam ?? "")}`}
                aria-label="Next page"
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs transition ${page >= totalPages ? "pointer-events-none border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500" : "border-slate-200 bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-indigo-500/40 dark:hover:text-indigo-200"}`}
              >
                <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="M7.5 5.5l5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
